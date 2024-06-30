const table = document.querySelector("table");
const tbody = table.querySelector("tbody");
// #region sorting
const headings = document.querySelectorAll("th");
const footerHeadings = document.querySelectorAll("tfoot th");
const rows = [
    ...tbody.querySelectorAll("tr")
];
const sortDirections = Array.from({
    length: headings.length
}, ()=>-1);
const NOTIFICATION = {
    WarningEmptyCell: "Cell can not be empty",
    WarningShortName: "Name can not be less then 4 letters",
    WarningSmallAge: "Age can not be less then 18",
    WarningBigAge: "Age can not be bigger then 90",
    SuccessUpdate: "User updated successfully",
    ErrorEmptyFields: "All fields must be filled in",
    SuccessAdd: "User added successfully"
};
const handlerCallback = (heading, index)=>{
    heading.addEventListener("click", ()=>sortColumn(index));
};
headings.forEach(handlerCallback);
footerHeadings.forEach(handlerCallback);
function sortColumn(index) {
    sortDirections[index] *= -1;
    rows.sort((a, b)=>{
        const aParams = a.cells[index].textContent;
        const bParams = b.cells[index].textContent;
        return sortDirections[index] * aParams.localeCompare(bParams, undefined, {
            numeric: true
        });
    });
    tbody.innerHTML = "";
    rows.forEach((row)=>tbody.append(row));
}
// #endregion
// #region active row
tbody.addEventListener("click", activateRow);
function activateRow(e) {
    const arrOfRows = [
        ...tbody.querySelectorAll("tr")
    ];
    arrOfRows.forEach((row)=>{
        row.className = "";
    });
    e.target.closest("tr").className = "active";
}
// #endregion
// #region create form
const newCustomerForm = createForm();
document.body.appendChild(newCustomerForm);
function createForm() {
    const form = document.createElement("form");
    form.setAttribute("class", "new-employee-form");
    const labelName = createInput("name");
    const labelPosition = createInput("position");
    const labelAge = createInput("age", "number");
    const labelSalary = createInput("salary", "number");
    const select = createSelect("office");
    const button = createButton();
    form.insertAdjacentElement("beforeend", labelName);
    form.insertAdjacentElement("beforeend", labelPosition);
    form.insertAdjacentElement("beforeend", select);
    form.insertAdjacentElement("beforeend", labelAge);
    form.insertAdjacentElement("beforeend", labelSalary);
    form.insertAdjacentElement("beforeend", button);
    return form;
}
function createInput(inputName, type = "text") {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const labelName = inputName[0].toUpperCase() + inputName.slice(1);
    input.name = inputName;
    input.type = type;
    input.dataset.qa = inputName;
    label.insertAdjacentText("afterbegin", `${labelName}`);
    label.insertAdjacentElement("beforeend", input);
    return label;
}
function createSelect(nameSelect) {
    const labelSelect = document.createElement("label");
    const select = document.createElement("select");
    select.name = nameSelect;
    select.dataset.qa = "office";
    const labelText = nameSelect[0].toUpperCase() + nameSelect.slice(1);
    labelSelect.insertAdjacentText("afterbegin", labelText);
    const options = [
        `Tokyo`,
        `Singapore`,
        `London`,
        `New York`,
        `Edinburgh`,
        `San Francisco`
    ].map((city)=>{
        const option = document.createElement("option");
        option.value = city;
        option.insertAdjacentText("beforeend", city);
        return option;
    });
    options.forEach((option)=>{
        select.insertAdjacentElement("beforeend", option);
    });
    labelSelect.insertAdjacentElement("beforeend", select);
    return labelSelect;
}
function createButton() {
    const button = document.createElement("button");
    button.setAttribute("id", "button");
    button.type = "submit";
    button.insertAdjacentText("beforeend", "Save to table");
    return button;
}
// #endregion
// #region submit functionality
newCustomerForm.addEventListener("submit", createNewEmploee);
function createNewEmploee(e) {
    e.preventDefault();
    const newRow = document.createElement("tr");
    const chekoutText = valuesValidation(newCustomerForm);
    showMessage(chekoutText);
    if (chekoutText.type === "error") return;
    const salary = +e.target["salary"].value;
    const values = [
        e.target["name"].value,
        e.target["position"].value,
        e.target["office"].value,
        e.target["age"].value,
        `$${salary.toLocaleString("en-EN")}`
    ];
    for (const value of values){
        const cell = document.createElement("td");
        cell.insertAdjacentText("beforeend", value);
        newRow.insertAdjacentElement("beforeend", cell);
    }
    tbody.insertAdjacentElement("beforeend", newRow);
    rows.push(newRow);
    newCustomerForm.reset();
}
function showMessage(message) {
    const newNotificationBlock = document.createElement("div");
    const oldNotificationBlock = document.querySelector(".notification");
    if (oldNotificationBlock) oldNotificationBlock.remove();
    const title = document.createElement("h1");
    const text = document.createElement("p");
    if (!newNotificationBlock.className) {
        newNotificationBlock.className = "notification";
        newNotificationBlock.dataset.qa = "notification";
    }
    switch(message.type){
        case "error":
            title.innerText = "ERROR";
            newNotificationBlock.classList.add("error");
            break;
        case "warning":
            title.innerText = "ERROR";
            newNotificationBlock.classList.add("error");
            break;
        default:
            title.innerText = "SUCCESS";
            newNotificationBlock.classList.add("success");
            break;
    }
    text.innerText = message.text;
    newNotificationBlock.insertAdjacentElement("afterbegin", title);
    newNotificationBlock.insertAdjacentElement("beforeend", text);
    document.body.append(newNotificationBlock);
    window.setTimeout(()=>{
        newNotificationBlock.remove();
    }, 5000);
}
function valuesValidation(inputToCheck) {
    const nameValue = inputToCheck["name"].value;
    const age = +inputToCheck["age"].value;
    const position = inputToCheck["position"].value;
    const office = inputToCheck["office"].value;
    const salary = inputToCheck["salary"].value;
    if (position === "" || office === "" || salary === "") return {
        type: "error",
        text: NOTIFICATION.ErrorEmptyFields
    };
    if (nameValue.length < 4) return {
        type: "error",
        text: NOTIFICATION.WarningShortName
    };
    if (age < 18) return {
        type: "error",
        text: NOTIFICATION.WarningSmallAge
    };
    if (age > 90) return {
        type: "error",
        text: NOTIFICATION.WarningBigAge
    };
    return {
        type: "success",
        text: NOTIFICATION.SuccessAdd
    };
}
// #endregion
// #region editing table
tbody.addEventListener("dblclick", editCell);
function editCell(e) {
    // TODO improve editing and validation
    const targetCell = e.target.closest("td");
    if (!targetCell) return;
    const value = targetCell.innerText;
    const cellInput = document.createElement("input");
    cellInput.className = "cell-input";
    cellInput.autofocus = true;
    cellInput.dataset.oldValue = value;
    cellInput.value = value;
    if (!isNaN(value)) {
        cellInput.type = "number";
        cellInput.min = 18;
        cellInput.max = 90;
    }
    if (!targetCell.nextElementSibling) {
        cellInput.type = "number";
        cellInput.value = parseFloat(value.slice(1).replace(/,/g, ""));
    }
    targetCell.innerText = "";
    targetCell.insertAdjacentElement("beforeend", cellInput);
    cellInput.addEventListener("blur", handlerBlur);
    cellInput.addEventListener("keypress", handlerKeypress);
}
function handlerBlur(e) {
    const input = e.target;
    const message = cellValid(input);
    showMessage(message);
    if (message.type === "error" || message.type === "warning") {
        input.focus();
        return;
    }
    saveCellValue(input);
}
function handlerKeypress(e) {
    const key = e.key;
    if (key !== "Enter") return;
    const input = e.target;
    const message = cellValid(input);
    showMessage(message);
    if (message.type === "error" || message.type === "warning") return;
    saveCellValue(input);
}
function saveCellValue(input) {
    let newValue = input.value;
    const targetCell = input.closest("td");
    if (!targetCell.nextElementSibling) newValue = `$${parseFloat(newValue).toLocaleString("en-EN")}`;
    targetCell.innerText = newValue;
    input.remove();
}
function cellValid(input) {
    const row = input.closest("tr");
    const arrOfCell = [
        ...row.querySelectorAll("td")
    ];
    const currentIndex = arrOfCell.findIndex((cell)=>{
        return cell.firstChild === input;
    });
    const value = input.value;
    if (value.length === 0 || value.trim() === "") return {
        type: "warning",
        text: NOTIFICATION.WarningEmptyCell
    };
    if (currentIndex === 0 && value.length < 4 || value.trim() === "") return {
        type: "warning",
        text: NOTIFICATION.WarningShortName
    };
    if (currentIndex === 3 && +value < 18 || value.trim() === "") return {
        type: "warning",
        text: NOTIFICATION.WarningSmallAge
    };
    if (currentIndex === 3 && +value > 90 || value.trim() === "") return {
        type: "warning",
        text: NOTIFICATION.WarningBigAge
    };
    return {
        type: "success",
        text: NOTIFICATION.SuccessUpdate
    };
}

//# sourceMappingURL=index.f75de5e1.js.map
