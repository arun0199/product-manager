const productForm = document.getElementById('productForm')
const productName = document.getElementById('productName')
const productPrice = document.getElementById('productPrice')
const productCategory = document.getElementById('productCategory')
const searchInput = document.getElementById('searchInput')
const error = document.getElementById('error')
const productList = document.getElementById('productList')
const productCount = document.getElementById("productCount");
const maxPrice = document.getElementById("maxPrice");
const categoryFilter = document.getElementById("categoryFilter");
const sortProducts = document.getElementById("sortProducts");
const productStats = document.getElementById("productStats");
const resetFilters = document.getElementById("resetFilters");

const products = JSON.parse(localStorage.getItem("products")) || [];

function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products))
}
function updateUI() {
    saveProducts(products);
    updateCategoryFilter();
    filterProducts();
    updateStats();
}

resetFilters.addEventListener("click", () => {
    searchInput.value = "";
    maxPrice.value = "";
    categoryFilter.value = "";
    sortProducts.value = "";

    filterProducts();
})

function updateStats() {
    const totalProducts = products.length;
    const  totalValue = products.reduce((total, product) => {
        return total + product.price
    }, 0);
    const averagePrice = totalProducts === 0 ? 0 : totalValue/totalProducts;
    productStats.textContent = `products: ${totalProducts} |
             Total Value: ${formattedPriceFun(totalValue)} |
             Average Price: ${formattedPriceFun(averagePrice)}`;
}


function isValidProductName(name) {
    return name !== null &&
        name.trim().length >= 3;
}
function isValidPrice(price) {
    return price !== null && Number(price) > 0;
}
function isValidCategory(category) {
    return category !== null &&
        category.trim().length >= 3;
}

function validateProduct(name, price, category) {
    return isValidProductName(name) &&
        isValidPrice(price) &&
        isValidCategory(category);
}

function showError(message) {
    error.textContent = message;
}




productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateProduct(productName.value, productPrice.value, productCategory.value)) {
        if (!isValidProductName(productName.value)) {
            showError("Product name must be at least 3 characters");
        } else if (!isValidPrice(productPrice.value)) {
            showError("Price must be greater than 0");
        } else if (!isValidCategory(productCategory.value)) {
            showError( "Product category must be at least 3 characters");
        }
        return;
    }

    showError("");

    const duplicateProduct = products.some(product => {
        return product.name.trim().toLowerCase() === productName.value.trim().toLowerCase() && product.category.trim().toLowerCase() === productCategory.value.trim().toLowerCase();
    })

    if (duplicateProduct) {
        showError("Product already exists");
        return;
    }

    const productObj = {
        id: Date.now(),
        name: productName.value.trim().toLowerCase(),
        price: Number(productPrice.value),
        category: productCategory.value.trim().toLowerCase()
    }
    products.push(productObj);
    productForm.reset();

    updateUI();
})

function formattedPriceFun(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(price)
};


function displayProducts(productItems) {
    productList.innerHTML = "";
    productCount.textContent = `Found products: ${productItems.length}`
    if (productItems.length === 0) {
        if(products.length === 0){
            productList.textContent = "No products added yet."
        }else{
            productList.textContent = "No products match your filters."
        }
        return;
    }

    productItems.forEach(product => {
        productList.innerHTML += `<br> <div class="product" data-id="${product.id}">
                         <div>${product.name}</div>
                         <p>${formattedPriceFun(product.price)}</p>
                         <span>${product.category}</span>
                         <button class="delete">Delete</button>
                         <button class="edit">Edit</button>
                         </div>  <br>  `
    })
};
productList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete") &&
        !e.target.classList.contains("edit")) {
        return;
    }
    const productCard = e.target.closest(".product")
    const id = Number(productCard.dataset.id)
    const index = products.findIndex(product => product.id === id)

    if (e.target.classList.contains("delete")) {
        products.splice(index, 1)
        updateUI();
    }
    else if (e.target.classList.contains("edit")) {
        const newName = prompt("Enter new ProductName")
        const newPrice = prompt("Enter new ProductPrice")
        const newCategory = prompt("Enter category")



        if (validateProduct(newName, newPrice, newCategory)) {
            const duplicateProduct = products.some((product, i) => {
                return i !== index &&
                    product.name === newName.trim().toLowerCase() &&
                    product.category === newCategory.trim().toLowerCase();
            });
            if (duplicateProduct) {
                showError("Product already exists")
                return;
            }
            showError("");
            products[index].name = newName.trim().toLowerCase();
            products[index].price = Number(newPrice);
            products[index].category = newCategory.trim().toLowerCase();
            updateUI();
        }
    }
})

function filterProducts() {
    const searchText = searchInput.value.toLowerCase();
    const max = Number(maxPrice.value);
    const selectedCategory = categoryFilter.value;


    const filteredProducts = products.filter(product => {

        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        const matchesPrice =
            maxPrice.value === "" || product.price <= max;

        const matchesCategory = selectedCategory === "" || product.category === selectedCategory;


        return matchesSearch && matchesPrice && matchesCategory;
    });

    if (sortProducts.value === "price-low") {
        filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortProducts.value === "price-high") {
        filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sortProducts.value === "name-az") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortProducts.value === "name-za") {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    displayProducts(filteredProducts);
}

searchInput.addEventListener("input", filterProducts);
maxPrice.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
sortProducts.addEventListener("change", filterProducts);


function updateCategoryFilter() {
    const selectedCategory = categoryFilter.value;
    categoryFilter.innerHTML = `<option value="">All categories</option>`;
    const categories = [...new Set(products.map(product => product.category))];
    categories.forEach(productCategory => {
        const option = document.createElement('option');
        option.value = productCategory;
        option.textContent = productCategory;
        categoryFilter.appendChild(option)
    })
    categoryFilter.value = selectedCategory;
}
updateCategoryFilter();










displayProducts(products);
