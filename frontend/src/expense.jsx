import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './expense.css';

// API Requests will be sent to this url
const API_URL_KEY = 'http://127.0.0.1:8000/expenditure'


export default function expense() {
  const [inputs, setInputs] = useState({}); // Stores form input as an object. This will be submitted to avoid re-renders.
  const [expense, setExpense] = useState('0.00'); // Stores the total amount in expenditure - updated by calculateExpenses().
  const [expenditureItem, setExpenditureItem] = useState([]); // Stores an array of "items", each item has a title, amt, etc etc.
  const [email, setEmail] = useState(localStorage.getItem('email'));


  // Store reference to input fields so we dont trigger a re-render when we update values+.
  const inputTitleRef = useRef(null);
  const inputAmountRef = useRef(null);
  const inputCategoryRef = useRef(null);
  const inputDateRef = useRef(null);
  const inputDescriptionRef = useRef(null);

  const navigate = useNavigate();

  // Fetch expenditure records from the database and calculates amt on initial render.
  useEffect(() => {
     fetchExpenditure();
     calculateExpenses();
     setEmail(localStorage.getItem('email'))
  }, []);

  // When an expenditure item is updated, recalculate expenses.
  useEffect(() => {
     calculateExpenses();
  }, [expenditureItem]);

  // Handles and stores input from form data. Automatically associates input with a name (id) and value (key) pairing. 
  const handleChange = (e) => {
    const name = e.target.id;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  };

  // Fetch expenses from the database, 
  const fetchExpenditure = async () => {
    try {
      const response = await fetch(API_URL_KEY);
      const data = await response.json();
      setExpenditureItem(data);
    } catch (error) {
      console.error("[Get] Fetch error: ", error)
    }
  }

  // Function to submit form data to the database
  const submitForm = async () => {
    // Only submit form if the form passes basic validation.
    if (validateForm()) {
      try {
        const response = await fetch(API_URL_KEY, {
          method: "POST",
          headers: {
            'Content-Type' : 'application/json'
          },
          body: JSON.stringify({
            id: new Date(Date.now()).toISOString(),
            email_id: localStorage.getItem('email'),
            title: inputs.title,
            amount: inputs.amount,
            category: inputs.category,
            date: inputs.date,
            description: inputs.description
          }),
        });
        if (response.ok) {
          fetchExpenditure();
          calculateExpenses();
        }
      } catch (error) {
        alert("[Add] Error saving new expense to the database.");
      }

      // Empty inputs use state and empty input fields so we can submit without DOM re-render.
      setInputs('');
      resetForm();
    }
  };


  // Helper function providing basic form validation.
  const validateForm = () => {
    // Validation checks
    if (inputs.title=='' || inputs.title==undefined) {
      alert("[Form] Please enter a title");
      return false
    } else if (inputs.amount==''|| inputs.amount==undefined || inputs.amount < 0) {
      alert("[Form] Please enter a valid amount"); // Amt can not be negative
      return false
    } else if (inputs.category=='' || inputs.category==undefined) {
      // Assume if unselected, category falls under uncategorised.
      inputs.category = "Uncategorised"
    } else

    // If code reaches here, all validation checks have passed.
    return true
  };

  // Helper function to reset the form to default when called.'
  // Go through each input for the form manually.
  const resetForm = () => {
    inputTitleRef.current.value = '';
    inputAmountRef.current.value = '';
    inputCategoryRef.current.value = '';
    inputDateRef.current.value = '';
    inputDescriptionRef.current.value = '';
  };


  // Delete a record rendered on the website from the database.
  const deleteExpenditure = async (id) => {
    // Look through the expenditureItems for one that has an id that matches the input id. (so each delete button is associated with it's own record).
    const expenseToDelete = expenditureItem.find(expense => expense.id === id);
    if (window.confirm("[Delete] Delete this expense item?")) {
      if (expenseToDelete !== undefined) {
        try {
          const response = await fetch(`${API_URL_KEY}/${id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            fetchExpenditure();
            calculateExpenses();
          } 
        } catch (error) {
          alert('[Delete] Error deleting this expense item.');
        }
      }
    }
  }

  // Helper function to calculate total amount from the expenditureitem array
  const calculateExpenses = () => {
    let amt = 0;
    for ( let i = 0; i < expenditureItem.length; i++ ) {
      amt += Number(expenditureItem[i].amount)
    }
    // Convert to common currency format $x.xx.
    amt = amt.toFixed(2)
    setExpense(amt)
  }

  const userLogout = () => {
    if (confirm("[User] Logout of my expense tracker?")) {
      localStorage.removeItem('email');
      setEmail('');
      navigate('/login', { replace: true })
    }
  }


  return (
    <div className="main-container">

      <div className="main-wrapper">
        <div className="header-container">
          <h1 className="header-title">Expense Tracker</h1>
          <br/>
          <div className="login-tracker">
            <span>You are logged in as {email}!</span>
            <button className="logout-button"
              onClick={userLogout}>Logout
            </button>
          </div>
          <br/>
        </div>

        <div className="content-container">
          {/* Total expenses & some other stats */}
          <div className="expense-container">
            <div className="expense-summary">
              <h2>Total expenditure</h2><br/>
              <h2>${expense}</h2>
            </div>
          </div>

          {/* Input fields */}
          <div className="input-container">
            <div className="section-heading">
              <h3>Add expense</h3>
            </div>
            <div className="section-content">
              <form>
                <div className="form-control">
                  <label for="title">* Title </label>
                  <input 
                    id="title"
                    type="text"
                    alt="title-input"
                    placeholder="Enter title.."
                    ref={inputTitleRef}
                    value={inputs.title}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className="form-control">
                  <label for="amount">* Amount </label>
                  <input
                    id="amount"
                    type="number"
                    alt="amount-input"
                    placeholder="Enter amount.."
                    ref={inputAmountRef}
                    value={inputs.amount} 
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className="form-control">
                  <label for="category">Category </label>
                  <select 
                    id="category"
                    alt="category-select"
                    ref={inputCategoryRef}
                    value={inputs.category} 
                    onChange={handleChange}
                    >
                    <option value="">Select a category</option>
                    <option value="Education">Education</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health</option>
                    <option value="Travel">Housing</option>
                    <option value="Personal">Personal</option>
                    <option value="Transport">Transport</option>
                    <option value="Savings">Savings</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Uncategorised">Uncategorised</option>
                  </select>
                </div>
                <div className="form-control">
                  <label for="date">Date </label>
                  <input
                    id="date"
                    type="date"
                    alt="date-input"
                    placeholder="Select date.."
                    ref={inputDateRef}
                    value={inputs.date} 
                    onChange={handleChange}
                    />
                </div>
                <div className="form-control">
                  <label for="description">Description </label>
                  <input 
                    id="description"
                    type="text"
                    alt="description-input"
                    placeholder="Enter a description.."
                    ref={inputDescriptionRef}
                    value={inputs.description} 
                    onChange={handleChange}
                    />
                </div>
              </form>
                <button 
                  className="add-button"
                  alt="Submit"
                  onClick={submitForm}>
                  Add expense
                </button>
            </div>
          </div>

          {/* List of all expenses */}
          <div className="logbook-container">
            <div className="section-heading">
              <h3>Expenditure Log</h3>
            </div>
            <div className="section-content">
              <ul className="expenditure-list">
                {/* Map out all entries in expenditureItem as its own record in the logbook */}
                {expenditureItem.map((expense) => (
                  <li key={expense.id} className="expenditure-item">
                    <span className="expenditure-title">{expense.title}</span>
                    <span className="expenditure-date">{expense.date}</span>
                    <span className="expenditure-category">{expense.category}</span>
                    <span className="expenditure-description">{expense.description}</span>
                    <span className="expenditure-amount">${expense.amount}</span>
                    <button className="expenditure-delete"
                      onClick={() => deleteExpenditure(expense.id)}>🗑️
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}