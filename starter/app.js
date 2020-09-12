
//Budget Controller
var budgetController = (function(id,description, value){
    var Expense = function (id,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function (id,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total:{
            exp: 0,
            inc: 0
        }
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
        expenseContainer: '.expenses__list'
    };

    return {

        getInput: function(){
            
            return {
                type : document.querySelector(DOMstirngs.inputType).value, //= inc or = exp
                description : document.querySelector(DOMstirngs.inputdescription).value,
                value : document.querySelector(DOMstirngs.inputValue).value,
            };         
        },

        addListItem:function(obj, type){
            
           var html, newHtml,element;
            //1. Create HTML string with placeholder text
            if(type ==='inc'){
                element = DOMstirngs.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type ==='exp'){
                element = DOMstirngs.expenseContainer;
                html ='<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
            //2. Replace the placeholder text with some actual data

            //3. Insert HTML to the DOM
        },

        getDOMStrings: function(){
            return DOMstirngs;
        }
        

    };




})();


//Global App Controller
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress', function(event){
    
            if(event.code ==='Enter' || event.which ===13){
                ctrlAddItem();
            }  
        });
    }


    var ctrlAddItem = function(){

        var input, newItem;

        //1. Get input data
        input = UICtrl.getInput();

        //2. Add info to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);


        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type );

        //4. Calculate the budget

        //5. Display the budget

    }

    return {
        init: function(){
            console.log('Application had started!');
            setupEventListeners();
        }
    };


})(budgetController, UIController);

controller.init();