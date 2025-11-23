require('dotenv').config();
const express =  require('express');
const mongoose =   require('mongoose');
const nodemailer = require('nodemailer');
const fs =         require('fs');
const path =       require('path');
const { generatePdf } = require('html-pdf-node');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const { MONGODB_URI, EMAIL_USER, EMAIL_PASS } = process.env;

if (!MONGODB_URI || !EMAIL_USER || !EMAIL_PASS) {
  console.error('Missing credentials in .env file!');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Failed:', err);
    process.exit(1);
  });

const Employee = mongoose.model('Employee', new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: String, designation: String, department: String,
  panCardNo: String, grossSalary: Number, totalDeductions: Number,
  netSalary: Number, email: String
}));

const SalarySlip = mongoose.model('SalarySlip', new mongoose.Schema({
  month: String, employeeId: String, payPeriod: String,
  workingDays: Number, balanceLeave: Number, paidLeaveDays: Number,
  unpaidLeave: Number, weekoffHolidays: Number,
  basicSalary: Number, hra: Number, da: Number,
  otherAllowances: Number, performanceBonus: Number, bonus: Number,
  professionalTax: Number, providentFund: Number,
  advanceSalary: Number, loanEmi: Number, otherDeductions: Number
}, { timestamps: true }));

app.post('/api/employee', async (req, res) => {
  try {
    await Employee.findOneAndUpdate(
      { employeeId: req.body.employeeId },
      req.body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find({}, 'employeeId name designation department');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/salary-slip', async (req, res) => {
  try {
    const data = req.body;
    const employee = await Employee.findOne({ employeeId: data.employeeId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    await new SalarySlip(data).save();

    let template = fs.readFileSync(path.join(__dirname, 'Template.html'), 'utf8');

    const values = {
      'Month': data.month,
      'EMP No.': employee.employeeId,
      'Pay Period': data.payPeriod,
      'Name': employee.name,
      'Worked Days': data.workingDays,
      'Designation': employee.designation || '',
      'Balance Leave': data.balanceLeave || 0,
      'Department': employee.department || '',
      'Paid Leave Days': data.paidLeaveDays || 0,
      'Pan Card No': employee.panCardNo || '',
      'Unpaid Leave': data.unpaidLeave || 0,
      'Weekoff and Holidays': data.weekoffHolidays || 0,
      'Basic Salary': data.basicSalary || 0,
      'HRA': data.hra || 0,
      'DA': data.da || 0,
      'Other Allowance': data.otherAllowances || 0,
      'Performance Bonus': data.performanceBonus || 0,
      'Bonus': data.bonus || 0,
      'Gross Salary': employee.grossSalary || 0,
      'Professional Tax': data.professionalTax || 0,
      'Provident Fund': data.providentFund || 0,
      'Advance Salary': data.advanceSalary || 0,
      'Loan EMI': data.loanEmi || 0,
      'Other Deduction': data.otherDeductions || 0,
      'Total Deductions': employee.totalDeductions || 0,
      'Net Salary': employee.netSalary || 0
    };

    template = template.replace(/{{(.*?)}}/g, (match, key) => values[key.trim()] || '');

    const pdfBuffer = await generatePdf(
      { content: template },
      { format: 'A4', printBackground: true }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: employee.email,
      subject: `Salary Slip - ${data.month}`,
      text: `Dear ${employee.name},\n\nPlease find your salary slip attached.\n\nBest regards,\nVohala Team`,
      attachments: [{
        filename: `Salary_Slip_${employee.name.replace(/\s+/g, '_')}_${data.month}.pdf`,
        content: pdfBuffer
      }]
    });

    res.json({ message: 'Salary slip emailed successfully!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running at http://localhost:3000');
});
