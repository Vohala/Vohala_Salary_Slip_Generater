const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb://localhost:27017/employees', { useNewUrlParser: true, useUnifiedTopology: true });


const employeeSchema = new mongoose.Schema({
    employeeId: String,
    name: String,
    designation: String,
    department: String,
    panCardNo: String,
    grossSalary: Number,
    totalDeductions: Number,
    netSalary: Number,
    email: String
});

const Employee = mongoose.model('Employee', employeeSchema);


const salarySlipSchema = new mongoose.Schema({
    month: String,
    employeeId: String,
    payPeriod: String,
    workingDays: Number,
    balanceLeave: Number,
    paidLeaveDays: Number,
    unpaidLeave: Number,
    weekoffHolidays: Number,
    basicSalary: Number,
    hra: Number,
    da: Number,
    otherAllowances: Number,
    performanceBonus: Number,
    bonus: Number,
    professionalTax: Number,
    providentFund: Number,
    advanceSalary: Number,
    loanEmi: Number,
    otherDeductions: Number
});

const SalarySlip = mongoose.model('SalarySlip', salarySlipSchema);


app.post('/api/employee', async (req, res) => {
    const {
        employeeId,
        name,
        designation,
        department,
        panCardNo,
        grossSalary,
        totalDeductions,
        netSalary,
        email
    } = req.body;

    const employee = new Employee({
        employeeId,
        name,
        designation,
        department,
        panCardNo,
        grossSalary,
        totalDeductions,
        netSalary,
        email
    });
    await employee.save();
    res.sendStatus(200);
});


app.get('/api/employees', async (req, res) => {
    try {
        const employees = await Employee.find({}, 'name'); 
        res.json(employees);
    } catch (error) {
        res.status(500).send('Error fetching employee names: ' + error.message);
    }
});


async function generatePdf(salarySlip, employee) {
    const pdfPath = path.resolve(__dirname, 'Salary Slip -  - 3.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];


    firstPage.drawText(salarySlip.month, { x: 250, y: 613, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.payPeriod, { x: 200, y: 599, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.workingDays, { x: 200, y: 585, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.balanceLeave, { x: 200, y: 570, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.paidLeaveDays, { x: 200, y: 557, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.unpaidLeave, { x: 200, y: 543, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.weekoffHolidays, { x: 200, y: 529, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.basicSalary, { x: 200, y: 522, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.hra, { x: 200, y: 509, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.da, { x: 200, y: 496, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.otherAllowances, { x: 200, y: 430, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.performanceBonus, { x: 200, y: 410, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.bonus, { x: 200, y: 390, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(employee.employeeId, { x: 500, y: 600, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(employee.name, { x: 150, y: 690, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(employee.designation, { x: 150, y: 670, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(employee.department, { x: 150, y: 650, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(employee.panCardNo, { x: 150, y: 630, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.professionalTax, { x: 150, y: 370, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.providentFund, { x: 150, y: 350, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.advanceSalary, { x: 150, y: 330, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.loanEmi, { x: 150, y: 310, size: 12, color: rgb(0, 0, 0) });
    firstPage.drawText(salarySlip.otherDeductions, { x: 150, y: 290, size: 12, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}


app.post('/api/salary-slip', async (req, res) => {
    const salarySlipData = req.body;

    const employee = await Employee.findOne({ employeeId: salarySlipData.employeeId });
    if (!employee) {
        return res.status(404).send('Employee not found');
    }

    try {
        
        const salarySlip = new SalarySlip(salarySlipData);
        await salarySlip.save();

        
        const pdfBytes = await generatePdf(salarySlipData, employee);

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: employee.email,
            subject: 'Salary Slip',
            text: `Dear ${employee.name},\n\nPlease find attached your salary slip for ${salarySlipData.month}.\n\nBest regards,\nYour Company`,
            attachments: [
                {
                    filename: 'Salary Slip.pdf',
                    content: pdfBytes,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error generating or sending PDF:', error);
        res.status(500).send('Error generating or sending PDF: ' + error.message);
    }
});


app.use(express.static('public'));

app.listen(3000, '0.0.0.0',() => {
    console.log('Server is running on port 3000');
});
