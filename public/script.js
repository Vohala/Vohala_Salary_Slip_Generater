// script.js

document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        employeeId: document.getElementById('employee-id').value,
        name: document.getElementById('name').value,
        designation: document.getElementById('designation').value,
        department: document.getElementById('department').value,
        panCardNo: document.getElementById('pan-card-no').value,
        grossSalary: document.getElementById('gross-salary').value,
        totalDeductions: document.getElementById('total-deductions').value,
        netSalary: document.getElementById('net-salary').value,
        email: document.getElementById('email').value
    };

    const response = await fetch('/api/employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (response.ok) {
        alert('Employee saved successfully!');
        loadEmployeeNames(); 
    } else {
        const errorText = await response.text();
        alert('Error saving employee: ' + errorText);
    }
});

document.getElementById('salary-slip-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        month: document.getElementById('month').value,
        employeeId: document.getElementById('employee-id').value,
        payPeriod: document.getElementById('pay-period').value,
        workingDays: document.getElementById('working-days').value,
        balanceLeave: document.getElementById('balance-leave').value,
        paidLeaveDays: document.getElementById('paid-leave-days').value,
        unpaidLeave: document.getElementById('unpaid-leave').value,
        weekoffHolidays: document.getElementById('weekoff-holidays').value,
        basicSalary: document.getElementById('basic-salary').value,
        hra: document.getElementById('hra').value,
        da: document.getElementById('da').value,
        otherAllowances: document.getElementById('other-allowances').value,
        performanceBonus: document.getElementById('performance-bonus').value,
        bonus: document.getElementById('bonus').value,
        professionalTax: document.getElementById('professional-tax').value,
        providentFund: document.getElementById('provident-fund').value,
        advanceSalary: document.getElementById('advance-salary').value,
        loanEmi: document.getElementById('loan-emi').value,
        otherDeductions: document.getElementById('other-deductions').value
    };

    const response = await fetch('/api/salary-slip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (response.ok) {
        alert('Salary slip generated and emailed successfully!');
    } else {
        const errorText = await response.text();
        alert('Error generating salary slip: ' + errorText);
    }
});


async function loadEmployeeNames() {
    const response = await fetch('/api/employees');
    const employees = await response.json();
    const employeeNameSelect = document.getElementById('employee-name');
    employeeNameSelect.innerHTML = '';
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.name;
        option.textContent = employee.name;
        employeeNameSelect.appendChild(option);
    });
}


document.addEventListener('DOMContentLoaded', loadEmployeeNames);

function showForm(formId) {
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => {
        if (form.id === formId) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
}
