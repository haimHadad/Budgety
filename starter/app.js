
//Budget Controller
var budgetController = (function(id,description, value){

    

    var Expense = function (id,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc >0 )
            this.percentage = Math.round((this.value / totalInc)*100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage= function(){
        return this.percentage;
    };

    var Income = function (id,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal =  function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });

        data.total[type] = sum;

    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total:{
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    };

    return {
        addItem:function(type,des,val){

            var newItem, ID;
            //Create new ID
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            else
                ID = 0;

            //Create new item based on type
            if(type==='exp'){
                newItem = new Expense(ID,des,val); 
                data.total.exp -= val;

            }else if(type==='inc'){
                newItem = new Income(ID,des,val); 
                data.total.inc += val;
            }

            

            //Push to array
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var index,ids;

           ids = data.allItems[type].map(function(current){
               return current.id;
           });

           index = ids.indexOf(id);

           if(index !== -1){
               data.allItems[type].splice(index,1)
           }
  
       },

        calculateBudget: function(){
            //Calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: incomes - expenses

            data.budget = data.total.inc - data.total.exp;

            //Calculate the percentage income that we spent
            if(data.total.inc > 0)
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            else
                data.total.percentage = -1;

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage();
            })
        },

        getBudget: function(){
            return {budget: data.budget,
                    totalInc: data.total.inc,
                    totalExp: data.total.exp,
                    percentage: data.percentage};
        },

        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                 cur.calcPercentage(data.total.inc);
                 return cur.getPercentage();
            });
            return allPerc;
        },

        getData: function(){
            return data;
        }

    };
    
    

})();


//UI Controller
var UIController = (function(){
    
    var DOMstirngs = {
        inputType: '.add__type',
        inputdescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container:'.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'


    };

    var formatNumber =  function(num,type){   
        var numSplit, int, dec,sign;
        if(num ===0){
            return '0'
        }

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1]; 
        if(int.length > 3){
            int = int.substr(0,int.length-3) +','+ int.substr(int.length-3,int.length)
        }
        type === 'exp' ? sign = '-' : sign = '+';
        return sign +' ' + int +'.' + dec;
        
    };

    var nodeListForEach = function(list,callback){
        for(var i=0; i< list.length; i++){
            callback(list[i], i);
        }
    };

    return {

        getInput: function(){
            
            return {
                type : document.querySelector(DOMstirngs.inputType).value, //= inc or = exp
                description : document.querySelector(DOMstirngs.inputdescription).value,
                value : parseFloat(document.querySelector(DOMstirngs.inputValue).value),
            };         
        },

        addListItem:function(obj, type){
            
           var html, newHtml,element;
            //1. Create HTML string with placeholder text
            if(type ==='inc'){
                element = DOMstirngs.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type ==='exp'){
                element = DOMstirngs.expenseContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">%percentage%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //2. Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            /* if(type ==='exp')
                newHtml = newHtml.replace('%percentage%',obj.percentage); */
            
            //3. Insert HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstirngs.expensePercLabel);
            
            nodeListForEach(fields, function(current,index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] +'%';
                else
                    current.textContent ='---';
            });
        },

        displayMonth: function(){
            var months =['January','February','March','April','May','June','July', 'August','September','October','November','December'];
            var now = new Date();
            document.querySelector(DOMstirngs.dateLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();
            
        },

        changedType : function(){

            var fields;

            fields = document.querySelectorAll(
                DOMstirngs.inputType + ',' +
                DOMstirngs.inputdescription + ',' +
                DOMstirngs.inputValue
                );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            } );

            document.querySelector(DOMstirngs.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMstirngs;
        },

        deleteListItem:function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields(){
            var fields,fieldsArr;
            document.querySelector(DOMstirngs.inputType).value = 'inc';
            fields = document.querySelectorAll(DOMstirngs.inputdescription + ','+DOMstirngs.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach((element, index, array) => {
                element.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type ='inc' : type ='exp';
                document.querySelector(DOMstirngs.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstirngs.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');  
                document.querySelector(DOMstirngs.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
                
            if(obj.percentage !== -1)
                document.querySelector(DOMstirngs.percentageLabel).textContent = obj.percentage+'%';
            else
                document.querySelector(DOMstirngs.percentageLabel).textContent = '---';
   
        }

    };

   


})();


//Global App Controller
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress', function(event){
    
            if(event.code ==='Enter' || event.which === 13){
                ctrlAddItem();
            }  
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    var updateBudget = function(){
        var budget;
        //1. Calculate the budget
            budgetCtrl.calculateBudget();
        //2. Return the budget 
            budget = budgetCtrl.getBudget();
        //3. Display the budget
            UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        var percentages;
        //1.Calculate percentage

        budgetCtrl.calculatePercentages();
        //2. Read percentages from budget controller
        percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function(){

        var input, newItem;

        //1. Get input data
        input = UICtrl.getInput();
        
        if(!input.description || !input.value || input.value <= 0)
            return;

        //2. Add info to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);


        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type );

        //4. Clear the fields
        UICtrl.clearFields();

        //5. Calculate and update the budget
        updateBudget();
        //6. Calculate and update the percentages
        updatePercentages();
    }

    var ctrlDeleteItem = function(event){
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //1.Delete item from data-structure
            budgetCtrl.deleteItem(type,ID);
            //2.Delete from UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the budget
            updateBudget();
            //4. Calculate and update the percentages
            updatePercentages();
        }
        
    }

    

    return {
        init: function(){
            console.log('Application had started!');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
                });
            UICtrl.displayMonth();
        }
    };


})(budgetController, UIController);

controller.init();