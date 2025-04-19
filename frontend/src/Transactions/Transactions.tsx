import React, { useEffect, useState } from 'react';
import './Transactions.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';
import { API_BASE_URL } from "../config";

/**
 * Transaction interface to define the shape of transaction data
 */
interface Transaction {
  id: string;
  descriptor: string;
  date: string;
  amount: number;
  category: string;
  type: string;
}

/**
 * Interface for the form data 
 */
interface TransactionFormData {
  descriptor: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

/**
 * Interface for sort configuration
 */
interface SortConfig {
  key: string;
  direction: string;
}

/**
 * Map of category names to their corresponding colors for styling
 */
const categoryColors: {[key: string]: string} = {
  FOOD: '#27ae60',
  RENT: '#e74c3c',
  UTILITIES: '#3498db',
  HEALTHCARE: '#9b59b6',
  ENTERTAINMENT: '#f39c12',
  PERSONAL: '#1abc9c',
  TRANSPORTATION: '#2980b9',
  INCOME: '#c0392b'
};


/**
 * Transactions Component - Manages displaying, filtering, and sorting financial transactions
 */
const Transactions: React.FC = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    descriptor: '',
    amount: 0,
    category: 'FOOD',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  /**
   * Formats a number as currency with 2 decimal places
   * @param amount - The number to format
   * @returns A formatted string (e.g., "1,234.56")
   */
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  /**
   * Fetch user transactions data
   */
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No token found.");
        }
        /**
       * !!!! DEBUGGING !!!!
       */

        console.log("Making API request to:", `${API_BASE_URL}/transaction`);
        console.log("With headers:", {
          "Content-Type": "application/json",
          "Authorization": "token exists: " + !!token
        });
      
      
  
        const response = await fetch(`${API_BASE_URL}/transaction`, {  
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        });


  
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch transactions");
        }
  
        const data = await response.json(); 
      
        // Format transactions for display
        const formattedTransactions = data.map((transaction: any) => ({
          id: transaction.id,
          descriptor: transaction.descriptor,
          date: new Date(transaction.postedAt).toLocaleDateString('en-US'),
          amount: parseFloat(transaction.amount),
          category: transaction.category,
          type: transaction.type
        }));
    
        setTransactions(formattedTransactions);
      } catch (error: any) {
        console.error("Error fetching transactions:", error.message);
        setError(error.message);
      }
    };

      fetchTransactions();
  }, []);

  /**
   * Fetch a specific transaction by ID
   */
  const fetchTransactionById = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found.");
      }
      
      const response = await fetch(`${API_BASE_URL}/transaction/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch transaction");
      }
      
      const transaction = await response.json();
      return transaction;
    } catch (error: any) {
      console.error("Error fetching transaction:", error.message);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Create a new transaction
   */
  const createTransaction = async (transactionData: any) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found.");
      }

      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Making API request to:", `${API_BASE_URL}/transaction`);
      console.log("With headers:", {
        "Content-Type": "application/json",
        "Authorization": "token exists: " + !!token
      });
      console.log("With body:", JSON.stringify(transactionData));
    

      
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify(transactionData)
      });

      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Fetch response:", response);
      
      if (!response.ok) {
        const err = await response.json();
        console.error("Error response:", err);
        throw new Error(err.message || "Failed to create transaction");
      }
      
      const createdTransaction = await response.json();
      console.log("Created transaction:", createdTransaction);


      return createdTransaction;
    } catch (error: any) {
      console.error("Error creating transaction:", error.message);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Delete a transaction
   */
  const deleteTransaction = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found.");
      }
      
      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Making DELETE API request to:", `${API_BASE_URL}/transaction/${id}`);
      console.log("With headers:", {
        "Content-Type": "application/json",
        "Authorization": "token exists: " + !!token
      });
      
      const response = await fetch(`${API_BASE_URL}/transaction/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        }
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete transaction");
      }
      
      // Remove transaction from state
      setTransactions(prevTransactions => 
        prevTransactions.filter(transaction => transaction.id !== id)
      );
      
      return true;
    } catch (error: any) {
      console.error("Error deleting transaction:", error.message);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Handle delete transaction click
   */
  const handleDeleteTransaction = (id: string) => {
    setConfirmDelete(id);
  };

  /**
   * Confirm delete transaction
   */
  const confirmDeleteTransaction = async () => {
    if (confirmDelete) {
      try {
        await deleteTransaction(confirmDelete);
        setConfirmDelete(null);
      } catch (error) {
        // Error handling is done in deleteTransaction function
      }
    }
  };

  /**
   * Cancel delete confirmation
   */
  const cancelDeleteTransaction = () => {
    setConfirmDelete(null);
  };

  /**
   * Filter transactions based on search term and selected category
   */
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || (
      (transaction.descriptor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  /**
   * Sort transactions based on current sort configuration
   */
  const sortedTransactions = React.useMemo(() => {
    let sortableTransactions = [...filteredTransactions];
    
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        // Special handling for amount column to sort numerically
        if (sortConfig.key === 'amount') {
          
          return sortConfig.direction === 'ascending' 
            ? a.amount - b.amount 
            : b.amount - a.amount;
        }
        
        // For other columns, sort alphabetically
        if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableTransactions;
  }, [filteredTransactions, sortConfig]);
  
  /**
   * Extract unique categories for the category filter
   */
  const categories = ['All', ...Array.from(new Set(transactions.map(t => t.category)))];
  
  /**
   * Calculate pagination values
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  /**
   * Navigate to previous page
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigate to next page
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  /**
   * Handle column sorting
   * @param key - The column to sort by
   */
  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  
  /**
   * Add a new transaction to the list
   */
  const handleAddTransaction = async () => {
    try {
      // Validate form
      if (!isFormValid) return;

      /**
       * !!!! DEBUGGING !!!!
       */

      console.log("Sending transaction with data:", {
        descriptor: newTransaction.descriptor,
        amount: newTransaction.amount,
        category: newTransaction.category,
        type: newTransaction.type,
        postedAt: new Date(newTransaction.date).toISOString()
      });

      // create payload for API
      const transactionPayload = {
        descriptor: newTransaction.descriptor,
        amount: newTransaction.amount,
        category: newTransaction.category,
        type: newTransaction.type,
        postedAt: new Date(newTransaction.date).toISOString()
      };

      // Call API to create transaction
      const createdTransaction = await createTransaction(transactionPayload);
      /**
       * !!!! DEBUGGING !!!!
       */
      console.log("Transaction created successfully:", createdTransaction);


      // Format created transaction for display
      const formattedTransaction = {
        id: createdTransaction.id,
        descriptor: createdTransaction.descriptor,
        date: new Date(createdTransaction.postedAt).toLocaleDateString('en-US'),
        amount: parseFloat(String(createdTransaction.amount)),
        category: createdTransaction.category,
        type: createdTransaction.type
      };

      // Update transactions state (UI)
      setTransactions(prevTransactions => [formattedTransaction, ...prevTransactions]);
      setNewTransaction({
        descriptor: '',
        amount: 0,
        category: 'FOOD',
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0]
      })
      setIsNewTransactionOpen(false);

    } catch (error: any) {
      console.error("Error adding transaction:", error.message);
      setError(error.message);
    }
    
  };

  /**
   * Validate form inputs
   */
  const isFormValid = newTransaction.descriptor.trim() !== '' && 
                      !isNaN(newTransaction.amount) && 
                      newTransaction.amount > 0 &&
                      newTransaction.type !== '' &&
                      newTransaction.date !== '';

  return (
    <div className="app">
      <Header />
      
      {/* Main content area */}
      <main className="transactions-content">
        {/* Page header */}
        <div className="transactions-header">
          <h1>Transactions</h1>
          <button 
            className="fab-add-transaction"
            onClick={() => setIsNewTransactionOpen(!isNewTransactionOpen)}
          >
            <span className="add-icon">+</span>
            💰 Add Transaction
          </button>
        </div>

         
        
        {/* New transaction form */}
        {isNewTransactionOpen && (
          <div className="new-transaction-form card">
            <h3>New Transaction</h3>
            <div className="form-grid">
              {/* Description field */}
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={newTransaction.descriptor} 
                  onChange={(e) => setNewTransaction({...newTransaction, descriptor: e.target.value})}
                  placeholder="e.g. Grocery Shopping"
                  required
                />
              </div>
              
              {/* Amount field */}
              <div className="form-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  value={newTransaction.amount} 
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              {/* Category dropdown */}
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  <option value="FOOD">Food</option>
                  <option value="RENT">Rent</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="INCOME">Income</option>
                  <option value="OTHER">Other</option>
                  
                </select>
              </div>

              {/* Type dropdown */}
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              {/* Date picker */}
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={newTransaction.date} 
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            {/* Form buttons */}
            <div className="form-actions">
              <button 
                className="submit-btn" 
                onClick={handleAddTransaction}
                disabled={!isFormValid}
              >
                Add Transaction
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setIsNewTransactionOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Search and filter section */}
        <div className="transactions-filters card">
          {/* Search input */}
          <div className="search-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>
          
          {/* Category filters */}
          <div className="category-filters">
            {['All', 'FOOD', 'RENT', 'UTILITIES', 'HEALTHCARE', 'ENTERTAINMENT', 'PERSONAL', 'TRANSPORTATION', 'INCOME', 'OTHER'].map(category => (
              <button 
                key={category}
                className={`category-filter ${category === selectedCategory ? 'active' : ''}`}
                style={category !== 'All' ? {borderColor: categoryColors[category]} : {}}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1); // Reset to first page when filtering
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Transactions table */}
        <div className="transactions-table-container card">
          {sortedTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => requestSort('name')}>
                    <div className="th-content">
                      <span>Name</span>
                      {sortConfig?.key === 'name' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => requestSort('date')}>
                    <div className="th-content">
                      <span>Date</span>
                      {sortConfig?.key === 'date' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => requestSort('category')}>
                    <div className="th-content">
                      <span>Category</span>
                      {sortConfig?.key === 'category' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => requestSort('type')}>
                    <div className="th-content">
                      <span>Type</span>
                      {sortConfig?.key === 'type' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="sortable amount-column" onClick={() => requestSort('amount')}>
                    <div className="th-content">
                      <span>Amount</span>
                      {sortConfig?.key === 'amount' && (
                        <span className="sort-direction">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {currentTransactions.map((transaction, index) => (
                  <tr key={transaction.id + index} className="transaction-row">
                    <td>{transaction.descriptor}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <div 
                        className="category-badge"
                        style={{
                          backgroundColor: `${categoryColors[transaction.category]}30`,
                          color: categoryColors[transaction.category]
                        }}
                      >
                        {transaction.category}
                      </div>
                    </td>
                    <td>
                      <div className={`type-badge ${transaction.type === 'INCOME' ? 'income' : 'expense'}`}>
                        {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                      </div>
                    </td>
                    <td className={`amount-column ${transaction.type === 'INCOME' ? 'income-amount' : 'expense-amount'}`}>
                      {transaction.amount}
                    </td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        aria-label="Delete transaction"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* No results message */
            <div className="no-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="15" x2="16" y2="15"></line>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              <p>No transactions found with the current filters</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {sortedTransactions.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} transactions
            </div>
            
            <div className="pagination-controls">
              <button 
                className="pagination-button" 
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="pagination-pages">
                <span className="current-page">{currentPage}</span>
                <span className="page-divider"> / </span>
                <span className="total-pages">{totalPages}</span>
              </div>
              <button 
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Delete confirmation modal*/}
        {confirmDelete && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={cancelDeleteTransaction}
                >
                  Cancel
                </button>
                <button 
                  className="delete-confirm-btn"
                  onClick={confirmDeleteTransaction}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Transactions;