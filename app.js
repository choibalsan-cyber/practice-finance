// Хэрэглэгчтэй ажиллах контроллер
let uiController = (function () {
  let DomStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addBtn: ".add__btn",
    incomeListLabel: ".income__list",
    expenseListLabel: ".expenses__list",
    budgetLabel: ".budget__value",
    totalIncLabel: ".budget__income--value",
    totalExpLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    containerDiv: ".container",
    expensePercentageLabel: ".item__percentage",
  };

  let nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  let formatMoney = function (num, type) {
    num += "";
    let a = num.split("").reverse().join("");
    let b = "";
    let count = 1;
    for (let i = 0; i < a.length; i++) {
      b += a[i];
      if (count % 3 === 0) b += ",";
      count++;
    }
    b = b.split("").reverse().join("");
    if (b[0] === ",") b = b.substr(1, b.length - 1);
    b = type === "inc" ? "+ " + b : "- " + b;
    return b;
  };

  return {
    getDomStrings: function () {
      return {
        addBtn: DomStrings.addBtn,
        containerDiv: DomStrings.containerDiv,
        inputType: DomStrings.inputType,
      };
    },

    getInput: function () {
      return {
        type: document.querySelector(DomStrings.inputType).value,
        description: document.querySelector(DomStrings.inputDescription).value,
        value: document.querySelector(DomStrings.inputValue).value,
      };
    },

    showDisplay: function (item, type) {
      let html, list;
      if (type === "inc") {
        list = DomStrings.incomeListLabel;
        html = `<div class="item clearfix" id="inc-$$ID$$">
            <div class="item__description">$$DESC$$</div>
            <div class="right clearfix">
                <div class="item__value">$$VAL$$</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>
        `;
      } else {
        list = DomStrings.expenseListLabel;
        html = `<div class="item clearfix" id="exp-$$ID$$">
        <div class="item__description">$$DESC$$</div>
        <div class="right clearfix">
            <div class="item__value">$$VAL$$</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>
    `;
      }

      html = html.replace("$$ID$$", item.id);
      html = html.replace("$$DESC$$", item.description);
      html = html.replace("$$VAL$$", formatMoney(item.value, type));
      document.querySelector(list).insertAdjacentHTML("beforeend", html);
    },

    clearInput: function () {
      let fields = document.querySelectorAll(
        `${DomStrings.inputDescription}, ${DomStrings.inputValue}`
      );

      let fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (el) {
        el.value = "";
      });
      fieldsArr[0].focus();
    },

    showBudget: function (tusuv) {
      let type = tusuv.tusuv > 0 ? "inc" : "exp";
      document.querySelector(DomStrings.budgetLabel).textContent = formatMoney(
        tusuv.tusuv,
        type
      );

      document.querySelector(DomStrings.totalIncLabel).textContent =
        formatMoney(tusuv.totalInc, "inc");
      document.querySelector(DomStrings.totalExpLabel).textContent =
        formatMoney(tusuv.totalExp, "exp");
      if (tusuv.huvi === 0) {
        document.querySelector(DomStrings.percentageLabel).textContent =
          tusuv.huvi;
      } else
        document.querySelector(DomStrings.percentageLabel).textContent =
          tusuv.huvi + "%";
    },

    deleteInput: function (nodeId) {
      let el = document.getElementById(nodeId);
      el.parentNode.removeChild(el);
    },

    changeType: function () {
      let fields = document.querySelectorAll(
        `${DomStrings.inputType}, ${DomStrings.inputDescription}, ${DomStrings.inputValue}`
      );

      nodeListForEach(fields, function (el) {
        el.classList.toggle("red-focus");
      });

      document.querySelector(DomStrings.addBtn).classList.toggle("red");
    },

    showPercentages: function (allPercentages) {
      let fields = document.querySelectorAll(DomStrings.expensePercentageLabel);
      nodeListForEach(fields, function (el, index) {
        el.textContent = allPercentages[index] + "%";
      });
    },
  };
})();

// Санхүүтэй ажиллах контроллер
let financeController = (function () {
  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    // Convert string to number
    this.value = parseInt(value);
  };

  let Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    // Convert string to number
    this.value = parseInt(value);
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalInc) {
    if (totalInc === 0 || this.value === 0) this.percentage = 0;
    else this.percentage = Math.round((this.value / totalInc) * 100);
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  let data = {
    items: {
      inc: [],
      exp: [],
    },
    total: {
      inc: 0,
      exp: 0,
    },
    huvi: 0,
    tusuv: 0,
  };

  let calcBudget = function (type) {
    let sum = 0;
    data.items[type].forEach(function (el) {
      sum += el.value;
    });
    data.total[type] = sum;
  };

  return {
    calcPercentages: function () {
      data.items.exp.forEach(function (el) {
        el.calcPercentage(data.total.inc);
      });
    },

    getPercentages: function () {
      let allPercentages = data.items.exp.map(function (el) {
        return el.getPercentage();
      });
      return allPercentages;
    },

    addItem: function (type, desc, val) {
      let id, item;
      id =
        data.items[type].length === 0
          ? 1
          : data.items[type][data.items[type].length - 1].id + 1;
      item =
        type === "inc" ? new Income(id, desc, val) : new Expense(id, desc, val);
      data.items[type].push(item);
      return item;
    },

    tusuvTootsooloh: function () {
      calcBudget("inc");
      calcBudget("exp");
      if (data.total.exp === 0 || data.total.inc === 0) data.huvi = 0;
      else data.huvi = Math.round((data.total.exp / data.total.inc) * 100);

      data.tusuv = data.total.inc - data.total.exp;
      return {
        tusuv: data.tusuv,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        huvi: data.huvi,
      };
    },

    deleteItem: function (id, type) {
      data.items[type].splice(data.items[type].indexOf(id), 1);
    },

    seeData: function () {
      return data;
    },
  };
})();

// Хэрэглэгч болон санхүүг холбох контроллер
let appController = (function (uiCtrl, fnCtrl) {
  // Контроллерт оруулсан өгөгдлийг авах
  let ctrlAddItem = function () {
    // 1. Дэлгэцнээс оруулсан өгөгдлийг авах
    let input = uiCtrl.getInput();
    // 2. Санхүүгийн контроллерт дамжуулаад тэнд хадгалах
    let item = fnCtrl.addItem(input.type, input.description, input.value);
    // 3. Дэлгэцэн дээр тохирох хэсэгт харуулах
    uiCtrl.showDisplay(item, input.type);
    // 4. Тайлбар дээр focus-лах, оролтууд цэвэрлэгдэх
    uiCtrl.clearInput();
    update();
  };

  //  Update хийх
  let update = function () {
    // 4. Төсвийг тооцоолох
    let budget = fnCtrl.tusuvTootsooloh();
    // 5. Тооцоолсон төсвийг дэлгэцэнд харуулах
    uiCtrl.showBudget(budget);
    fnCtrl.calcPercentages();
    let allPercentages = fnCtrl.getPercentages();
    console.log(allPercentages);
    uiCtrl.showPercentages(allPercentages);
  };

  // Эвент листенерүүдийг бэлтгэх
  let setupEventListeners = function () {
    // Дэлгэцнээс Dom элементийг авах
    let Dom = uiCtrl.getDomStrings();

    // Correct товчны эвент листенер
    document.querySelector(Dom.addBtn).addEventListener("click", function () {
      ctrlAddItem();
    });

    // Enter товчны эвент листенер
    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13 || e.keyCode === 13) {
        ctrlAddItem();
      }
    });

    // Устгах товчны эвент листенер
    document
      .querySelector(Dom.containerDiv)
      .addEventListener("click", function (e) {
        let nodeId = e.target.parentNode.parentNode.parentNode.parentNode.id;
        let arr = nodeId.split("-");
        let type = arr[0];
        let id = arr[1];
        // Санхүүгийн модульд хадгалагдсан өгөгдлийг устгах
        fnCtrl.deleteItem(id, type);
        // Дахин тооцоолох
        update();
        // Дэлгэцнээс устгах
        uiCtrl.deleteInput(nodeId);
        //
      });

    // Change EventListener
    document
      .querySelector(Dom.inputType)
      .addEventListener("change", uiCtrl.changeType);
  };

  return {
    init: function () {
      uiCtrl.showBudget({
        tusuv: 0,
        totalInc: 0,
        totalExp: 0,
        huvi: 0,
      });
      setupEventListeners();
    },
  };
})(uiController, financeController);

appController.init();
