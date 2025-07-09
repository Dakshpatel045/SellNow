$(document).ready(function () {
  // Load header and footer
  $("#header").load("header.html", function () {
    $("#footer").load("footer.html");
    $("#authModal").on("show.bs.modal", function () {
      $("#loginForm")[0].reset(); // Clear login form fields
      $("#signupForm")[0].reset(); // Clear signup form fields
      $(".text-danger").addClass("d-none"); // Hide validation errors
    });
    // Functions
    function showForm(formType) {
      $(".auth-form").addClass("d-none");
      $(".btn-outline-primary").removeClass("active");
      if (formType === "login") {
        $("#login-form").removeClass("d-none");
        $(".btn-outline-primary:contains('Login')").addClass("active");
      } else {
        $("#signup-form").removeClass("d-none");
        $(".btn-outline-primary:contains('Signup')").addClass("active");
      }
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function checkLoginStatus() {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        $(".nav-login").addClass("d-none");
        $(".nav-logout").removeClass("d-none");
        $("#logoutText").text(
          `Logout (${currentUser.name} - ${currentUser.role})`
        );

        // Show Post Product only for sellers
        if (currentUser.role === "seller") {
          $(".nav-post-product").removeClass("d-none");
        } else {
          $(".nav-post-product").addClass("d-none");
        }
      } else {
        $(".nav-login").removeClass("d-none");
        $(".nav-logout").addClass("d-none");
        $(".nav-post-product").addClass("d-none");
        $("#logoutText").text("Logout");
      }
    }

    // Bindings using delegation
    $(document).on("click", ".btn-outline-primary", function () {
      const type = $(this).text().trim().toLowerCase();
      showForm(type);
    });

    // Login
    $(document).on("submit", "#loginForm", function (e) {
      e.preventDefault();
      let email = $("#loginEmail").val().trim();
      let password = $("#loginPassword").val().trim();
      let valid = true;
      $(".text-danger").addClass("d-none");

      if (!isValidEmail(email)) {
        $("#loginEmailError").removeClass("d-none");
        valid = false;
      }
      if (password.length < 6) {
        $("#loginPasswordError").removeClass("d-none");
        valid = false;
      }

      if (valid) {
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        let user = users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          localStorage.setItem("currentUser", JSON.stringify(user));
          $("#authModal").modal("hide");
          alert("Login successful!");
          checkLoginStatus();
        } else {
          $("#loginEmailError")
            .text("Invalid email or password")
            .removeClass("d-none");
        }
      }
    });

    // Signup
    $(document).on("submit", "#signupForm", function (e) {
      e.preventDefault();
      let name = $("#signupName").val().trim();
      let email = $("#signupEmail").val().trim();
      let password = $("#signupPassword").val().trim();
      let role = $("#userRole").val();
      let valid = true;

      $(".text-danger").addClass("d-none");

      if (name === "") {
        $("#signupNameError").removeClass("d-none");
        valid = false;
      }
      if (!isValidEmail(email)) {
        $("#signupEmailError").text("Invalid email").removeClass("d-none");
        valid = false;
      } else {
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        if (users.some((u) => u.email === email)) {
          $("#signupEmailError")
            .text("Email already exists")
            .removeClass("d-none");
          valid = false;
        }
      }
      if (password.length < 6) {
        $("#signupPasswordError").removeClass("d-none");
        valid = false;
      }
      if (!role) {
        $("#userRoleError").removeClass("d-none");
        valid = false;
      }

      if (valid) {
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        let newUser = { id: Date.now(), name, email, password, role };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        $("#authModal").modal("hide");
        alert("Signup successful!");
        checkLoginStatus();
      }
    });

    // Logout
    $(document).on("click", "#logoutLink", function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      checkLoginStatus();
      alert("Logged out successfully!");
      window.location.href = "index.html";
    });

    // Initial check
    checkLoginStatus();
  });

  // 🚀 POST PRODUCT PAGE LOGIC

  if ($("#postProductForm").length > 0) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "seller") {
      alert("Only sellers can post products. Redirecting to Home.");
      window.location.href = "index.html";
    }

    // 📌 Load seller's products on page load
    function loadSellerProducts() {
      let products = JSON.parse(localStorage.getItem("products") || "[]");
      let sellerProducts = products.filter(
        (p) => p.sellerId === currentUser.id
      );
      let $list = $("#sellerProductList");
      $list.empty();

      if (sellerProducts.length === 0) {
        $list.html(
          "<p class='text-center'>You have not posted any products yet.</p>"
        );
        return;
      }

      sellerProducts.forEach((product) => {
        $list.append(`
        <div class="col-md-4 mb-3">
            <div class="card h-100 shadow-sm">
                <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text mb-1">Price: ₹${product.price}</p>
                    <p class="card-text mb-1">Category: ${product.category}</p>
                    <p class="card-text mb-2">City: ${product.city}, ${product.state}</p>
                    <div class="mt-auto d-flex justify-content-between">
    <button class="btn btn-sm btn-secondary view-chat-btn" data-id="${product.id}">
        <i class="bi bi-chat-dots"></i> View Chats
    </button>
    <button class="btn btn-sm btn-primary edit-product-btn" data-id="${product.id}">
        <i class="bi bi-pencil"></i> Edit
    </button>
    <button class="btn btn-sm btn-danger delete-product-btn" data-id="${product.id}">
        <i class="bi bi-trash"></i> Delete
    </button>
</div>
                </div>
            </div>
        </div>
    `);
      });
    }

    loadSellerProducts(); // ✅ call on page load

    $("#postProductForm").submit(function (e) {
      e.preventDefault();

      const title = $("#productTitle").val().trim();
      const description = $("#productDescription").val().trim();
      const price = parseFloat($("#productPrice").val());
      const category = $("#productCategory").val();
      const city = $("#productCity").val().trim();
      const state = $("#productState").val().trim();
      const imageFile = $("#productImage")[0].files[0];

      if (
        !title ||
        !description ||
        !price ||
        !category ||
        !city ||
        !state ||
        !imageFile
      ) {
        alert("Please fill all fields and select an image.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const imageBase64 = e.target.result;
        const products = JSON.parse(localStorage.getItem("products") || "[]");

        const newProduct = {
          id: Date.now(),
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          title,
          description,
          price,
          category,
          city,
          state,
          image: imageBase64,
          datePosted: new Date().toISOString(),
        };

        products.push(newProduct);
        localStorage.setItem("products", JSON.stringify(products));

        alert("Product posted successfully!");
        $("#postProductForm")[0].reset();
        loadSellerProducts(); // ✅ refresh product list after posting
      };
      reader.readAsDataURL(imageFile);
    });

    // Edit product button click
    $(document).on("click", ".edit-product-btn", function () {
      const productId = $(this).data("id");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => p.id === productId);

      if (product) {
        $("#editProductId").val(product.id);
        $("#editProductTitle").val(product.title);
        $("#editProductDescription").val(product.description);
        $("#editProductPrice").val(product.price);
        $("#editProductCategory").val(product.category);
        $("#editProductCity").val(product.city);
        $("#editProductState").val(product.state);
        $("#editProductImage").val(""); // clear previous image
        $("#editProductModal").modal("show");
      }
    });

    // Handle edit product form submit
    $("#editProductForm").submit(function (e) {
      e.preventDefault();
      const productId = parseInt($("#editProductId").val());
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const productIndex = products.findIndex((p) => p.id === productId);

      if (productIndex !== -1) {
        const product = products[productIndex];
        product.title = $("#editProductTitle").val().trim();
        product.description = $("#editProductDescription").val().trim();
        product.price = parseFloat($("#editProductPrice").val());
        product.category = $("#editProductCategory").val().trim();
        product.city = $("#editProductCity").val().trim();
        product.state = $("#editProductState").val().trim();

        const newImageFile = $("#editProductImage")[0].files[0];
        if (newImageFile) {
          const reader = new FileReader();
          reader.onload = function (e) {
            product.image = e.target.result;
            products[productIndex] = product;
            localStorage.setItem("products", JSON.stringify(products));
            $("#editProductModal").modal("hide");
            loadSellerProducts();
            alert("Product updated successfully!");
          };
          reader.readAsDataURL(newImageFile);
        } else {
          products[productIndex] = product;
          localStorage.setItem("products", JSON.stringify(products));
          $("#editProductModal").modal("hide");
          loadSellerProducts();
          alert("Product updated successfully!");
        }
      }
    });

    // Delete product button click
    $(document).on("click", ".delete-product-btn", function () {
      const productId = $(this).data("id");
      if (confirm("Are you sure you want to delete this product?")) {
        const products = JSON.parse(localStorage.getItem("products") || "[]");
        const updatedProducts = products.filter((p) => p.id !== productId);
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        loadSellerProducts();
        alert("Product deleted successfully!");
      }
    });
  }

  //Product Page Jquery

  // 🚀 PRODUCTS PAGE LOGIC
  if ($("#productList").length > 0) {
    const products = JSON.parse(localStorage.getItem("products") || "[]");

    // Populate filter dropdowns dynamically
    const categories = [...new Set(products.map((p) => p.category))];
    const cities = [...new Set(products.map((p) => p.city))];
    const states = [...new Set(products.map((p) => p.state))];

    categories.forEach((c) => {
      $("#filterCategory").append(`<option value="${c}">${c}</option>`);
    });
    cities.forEach((city) => {
      $("#filterCity").append(`<option value="${city}">${city}</option>`);
    });
    states.forEach((state) => {
      $("#filterState").append(`<option value="${state}">${state}</option>`);
    });

    function renderProducts(filter = {}) {
      const { category, city, state, minPrice, maxPrice, name } = filter;
      $("#productList").empty();

      let filteredProducts = products.filter((p) => {
        let match = true;
        if (category && p.category !== category) match = false;
        if (city && p.city !== city) match = false;
        if (state && p.state !== state) match = false;
        if (minPrice && p.price < parseFloat(minPrice)) match = false;
        if (maxPrice && p.price > parseFloat(maxPrice)) match = false;
        if (name && !p.title.toLowerCase().includes(name.toLowerCase()))
          match = false;
        return match;
      });

      if (filteredProducts.length === 0) {
        $("#productList").html(
          "<p class='text-center text-muted'>No products found matching the criteria.</p>"
        );
        return;
      }

      filteredProducts.forEach((product) => {
        const card = `
        <div class="col-md-4 mb-3">
            <div class="card h-100 shadow-sm">
                <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text mb-1">Price: ₹${product.price}</p>
                    <p class="card-text mb-1 ">

    Seller: ${product.sellerName}
</p>
                    <p class="card-text mb-1">Category: ${product.category}</p>
                    <p class="card-text mb-1">City: ${product.city}, ${product.state}</p>
                    <button class="btn btn-primary mt-auto view-details-btn" data-id="${product.id}">View Details</button>
                </div>
            </div>
        </div>
    `;
        $("#productList").append(card);
      });
    }

    // Initially render all products
    renderProducts();

    // Bind filters
    $(
      "#filterCategory, #filterCity, #filterState, #filterMinPrice, #filterMaxPrice, #filterName"
    ).on("input change", function () {
      const filter = {
        category: $("#filterCategory").val(),
        city: $("#filterCity").val(),
        state: $("#filterState").val(),
        minPrice: $("#filterMinPrice").val(),
        maxPrice: $("#filterMaxPrice").val(),
        name: $("#filterName").val().trim(),
      };
      renderProducts(filter);
    });

    // Optional: View Details button handler for future product-details.html
    $(document).on("click", ".view-details-btn", function () {
      const productId = $(this).data("id");
      window.location.href = `product-details.html?id=${productId}`;
    });
  }

  // 🚀 PRODUCT DETAILS PAGE LOGIC
  if ($("#productDetailsContainer").length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id"));
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const product = products.find((p) => p.id === productId);

    if (!product) {
      $("#productDetailsContainer").html(
        "<p class='text-center'>Product not found.</p>"
      );
      return;
    }

    $("#productDetailsContainer").html(`
            <div class="col-md-6 col-lg-5 mx-auto">
                <div class="card shadow-sm rounded-4">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h3 class="card-title">${product.title}</h3>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text fw-semibold">Price: ₹${product.price}</p>
                        <p class="card-text text-muted">
                            <i class="bi bi-person-circle me-1"></i> Seller: ${product.sellerName}
                        </p>
                        <p class="card-text">Category: ${product.category}</p>
                        <p class="card-text">Location: ${product.city}, ${product.state}</p>
                        <button class="btn btn-primary mt-2" id="chatWithSellerBtn">
                            <i class="bi bi-chat-dots me-1"></i> Chat with Seller
                        </button>
                    </div>
                </div>
            </div>
        `);

    // Open chat modal on click
    $(document).on("click", "#chatWithSellerBtn", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("Please login to chat with the seller.");
        $("#authModal").modal("show");
        return;
      }
      if (currentUser.id === product.sellerId) {
        alert("You cannot chat with yourself!");
        return;
      }
      $("#chatModal").modal("show");
      loadChatMessages(product.sellerId, currentUser.id, productId);
    });


    // Handle send message
    $(document).on("click", "#sendChatBtn", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const message = $("#chatInput").val().trim();
      if (!message) {
        alert("Please enter a message.");
        return;
      }

      const chatKey = `chat_${currentUser.id}_${product.sellerId}_${productId}`;
      let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");

      chatHistory.push({
        senderId: currentUser.id,
        senderName: currentUser.name,
        message,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem(chatKey, JSON.stringify(chatHistory));
      $("#chatInput").val("");
      loadChatMessages(product.sellerId, currentUser.id, productId);
    });

    // Auto-refresh for buyer
    let chatRefreshInterval;
    $("#chatModal").on("shown.bs.modal", function () {
      chatRefreshInterval = setInterval(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          loadChatMessages(product.sellerId, currentUser.id, productId);
        }
      }, 3000);
    });

    $("#chatModal").on("hidden.bs.modal", function () {
      clearInterval(chatRefreshInterval);
      $("#chatMessages").empty();
      $("#chatInput").val("");
    });

  }

    // Handle view chat button
    $(document).on("click", ".view-chat-btn", function () {
      const productId = $(this).data("id");
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      
      // Clear previous buyer select
      $("#buyerSelectContainer").remove();
      
      // Find all chats for this product
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter(key => key.startsWith(`chat_`) && key.endsWith(`_${productId}`));
      
      if (chatKeys.length === 0) {
        alert("No chats from buyers for this product yet.");
        return;
      }

      // Get unique buyers
      const buyers = new Set();
      const buyerDetails = new Map();
      chatKeys.forEach(key => {
        const parts = key.split("_");
        const buyerId = parseInt(parts[1]);
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const buyer = users.find(u => u.id === buyerId);
        if (buyer) {
          buyers.add(buyerId);
          buyerDetails.set(buyerId, buyer);
        }
      });

      if (buyers.size === 0) {
        alert("No valid buyer chats found for this product.");
        return;
      }

      // Create buyer select dropdown
      let buyerSelectHtml = `
        <div id="buyerSelectContainer" class="mb-3">
          <label for="buyerSelect" class="form-label">Select Buyer:</label>
          <select id="buyerSelect" class="form-select">
            <option value="">Select a buyer</option>
      `;
      buyers.forEach(buyerId => {
        const buyer = buyerDetails.get(buyerId);
        buyerSelectHtml += `<option value="${buyerId}">${buyer.name} (${buyer.email})</option>`;
      });
      buyerSelectHtml += "</select></div>";

      // Add dropdown to modal and show
      $("#chatModal .modal-body").prepend(buyerSelectHtml);
      $("#chatModal").modal("show");

      // Handle buyer selection
      $("#buyerSelect").off("change").on("change", function () {
        const buyerId = $(this).val();
        if (buyerId) {
          loadChatMessages(currentUser.id, parseInt(buyerId), productId);
        } else {
          $("#chatMessages").empty();
        }
      });

      // Handle send message
      $("#sendChatBtn").off("click").on("click", function () {
        const buyerId = $("#buyerSelect").val();
        const message = $("#chatInput").val().trim();

        if (!buyerId) {
          alert("Please select a buyer first.");
          return;
        }
        if (!message) {
          alert("Please enter a message.");
          return;
        }

        const chatKey = `chat_${buyerId}_${currentUser.id}_${productId}`;
        let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");

        chatHistory.push({
          senderId: currentUser.id,
          senderName: currentUser.name,
          message,
          timestamp: new Date().toISOString(),
        });

        localStorage.setItem(chatKey, JSON.stringify(chatHistory));
        $("#chatInput").val("");
        loadChatMessages(currentUser.id, parseInt(buyerId), productId);
      });
    });

    function loadChatMessages(sellerId, buyerId, productId) {
      const chatKey = `chat_${buyerId}_${sellerId}_${productId}`;
      let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");
      const chatContainer = $("#chatMessages").empty();

      if (chatHistory.length === 0) {
        chatContainer.html("<p class='text-muted text-center'>No messages yet.</p>");
        return;
      }

      chatHistory.forEach((msg) => {
        const alignment = msg.senderId === sellerId ? "text-end" : "text-start";
        const badgeColor = msg.senderId === sellerId ? "primary" : "secondary";
        chatContainer.append(`
          <div class="${alignment}">
            <span class="badge bg-${badgeColor} mb-1">
              ${msg.senderName}: ${msg.message}
              <small class="text-muted ms-2">${new Date(msg.timestamp).toLocaleString()}</small>
            </span>
          </div>
        `);
      });

      // Scroll to bottom
      chatContainer.scrollTop(chatContainer[0].scrollHeight);
    }

     let chatRefreshInterval;
    $("#chatModal").on("shown.bs.modal", function () {
      chatRefreshInterval = setInterval(() => {
        const buyerId = $("#buyerSelect").val();
        const productId = $(".view-chat-btn:hover").data("id") || 
                         $(".view-chat-btn:focus").data("id");
        if (buyerId && productId) {
          const currentUser = JSON.parse(localStorage.getItem("currentUser"));
          loadChatMessages(currentUser.id, parseInt(buyerId), productId);
        }
      }, 3000);
    });

    $("#chatModal").on("hidden.bs.modal", function () {
      clearInterval(chatRefreshInterval);
      $("#buyerSelectContainer").remove();
      $("#chatMessages").empty();
      $("#chatInput").val("");
    });
  });



  
