let products = [];
let currentSort = {};

async function loadProducts() {
  const response = await fetch("/products");
  products = await response.json();
  currentSort = {};
  displayProducts(products);
}

function displayProducts(data) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  if (data.length === 0) {
    productList.textContent = "No data available.";
    return;
  }

  const table = document.createElement("table");
  const headers = Object.keys(data[0]);
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;

    th.addEventListener("click", () => {
      sortColumn(header);
    });

    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  data.forEach((product) => {
    const row = document.createElement("tr");
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.textContent = product[header];
      row.appendChild(td);
    });
    row.addEventListener("click", () => {
      const rowData = headers.map((header) => product[header]).join("\t");
      copyToClipboard(rowData);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  productList.appendChild(table);
}

function sortColumn(column) {
  const sortOrder =
    currentSort[column] === "asc"
      ? "desc"
      : currentSort[column] === "desc"
      ? "none"
      : "asc";
  currentSort = { [column]: sortOrder };

  let sortedData = [...products];

  if (sortOrder === "asc") {
    sortedData.sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });
  } else if (sortOrder === "desc") {
    sortedData.sort((a, b) => {
      if (a[column] > b[column]) return -1;
      if (a[column] < b[column]) return 1;
      return 0;
    });
  }

  if (sortOrder === "none") {
    sortedData = products;
  }

  displayProducts(sortedData);
}

function copyToClipboard(text) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
  alert("Data copied to clipboard: " + text);
}

window.onload = loadProducts;

document
  .getElementById("importForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const file = document.getElementById("fileInput").files[0];
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/import-products", { method: "POST", body: formData });
    loadProducts();
  });
