async function loadEmployees() {
  try {
    const res = await fetch('/api/employees');
    const employees = await res.json();
    const select = document.getElementById('employee-select');
    select.innerHTML = '<option value="" disabled selected>Select Employee</option>';
    employees.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.employeeId;
      opt.textContent = `${emp.name} - ${emp.designation} (${emp.department})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Load employees failed:', err);
  }
}

document.getElementById('employee-form').onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    employeeId: document.getElementById('employee-id').value.trim(),
    name: document.getElementById('name').value.trim(),
    designation: document.getElementById('designation').value.trim(),
    department: document.getElementById('department').value.trim(),
    panCardNo: document.getElementById('pan-card-no').value.trim(),
    grossSalary: +document.getElementById('gross-salary').value,
    totalDeductions: +document.getElementById('total-deductions').value,
    netSalary: +document.getElementById('net-salary').value,
    email: document.getElementById('email').value.trim()
  };

  const res = await fetch('/api/employee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    alert('Employee saved!');
    e.target.reset();
    loadEmployees();
  } else {
    alert('Error: ' + await res.text());
  }
};

document.getElementById('salary-slip-form').onsubmit = async (e) => {
  e.preventDefault();
  const empId = document.getElementById('employee-select').value;
  if (!empId) return alert('Please select an employee');

  const data = {
    month: document.getElementById('month').value,
    employeeId: empId,
    payPeriod: document.getElementById('pay-period').value,
    workingDays: +document.getElementById('working-days').value,
    balanceLeave: +document.getElementById('balance-leave').value || 0,
    paidLeaveDays: +document.getElementById('paid-leave-days').value || 0,
    unpaidLeave: +document.getElementById('unpaid-leave').value || 0,
    weekoffHolidays: +document.getElementById('weekoff-holidays').value,
    basicSalary: +document.getElementById('basic-salary').value,
    hra: +document.getElementById('hra').value,
    da: +document.getElementById('da').value,
    otherAllowances: +document.getElementById('other-allowances').value || 0,
    performanceBonus: +document.getElementById('performance-bonus').value || 0,
    bonus: +document.getElementById('bonus').value || 0,
    professionalTax: +document.getElementById('professional-tax').value || 0,
    providentFund: +document.getElementById('provident-fund').value || 0,
    advanceSalary: +document.getElementById('advance-salary').value || 0,
    loanEmi: +document.getElementById('loan-emi').value || 0,
    otherDeductions: +document.getElementById('other-deductions').value || 0
  };

  const res = await fetch('/api/salary-slip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (res.ok) {
    alert('Salary slip generated and emailed successfully!');
    e.target.reset();
    document.getElementById('employee-select').selectedIndex = 0;
  } else {
    alert('Error: ' + (result.error || 'Unknown error'));
  }
};

document.addEventListener('DOMContentLoaded', loadEmployees);
