import React, { useState, useEffect } from 'react';
import './App.css';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [greeted, setGreeted] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (!greeted) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Привіт!', sender: 'chat' },
          { text: 'Чим я вам можу допомогти?', sender: 'chat' }
        ]);
        setGreeted(true);
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedQuestion(null);
    setInputValue('');
  };

  const handleSelectQuestion = (question) => {
    if (question !== 'Своє питання') {
      setSelectedQuestion(question);
      setIsTyping(true);
      setMessages((prevMessages) => [...prevMessages, { text: question, sender: 'user' }]);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prevMessages) => [...prevMessages, { text: getAnswer(question), sender: 'chat' }]);
      }, 1000);
    } else {
      setSelectedQuestion(question);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      setMessages((prevMessages) => [...prevMessages, { text: inputValue, sender: 'user' }]);
      setIsTyping(true);
      try {
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
        });
        const data = await response.json();
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: data.answer, sender: 'chat' },
            { text: 'Дякую за ваше запитання!', sender: 'chat' }
          ]);
        }, 1000);
      } catch (error) {
        console.error('Error sending message:', error);
      }
      setInputValue('');
    }
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
  };

  const getAnswer = (question) => {
    const today = new Date();
    const newYear = new Date(today.getFullYear() + 1, 0, 1);
    const diffTime = Math.abs(newYear - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    const answers = {
      'Який сьогодні день?': `Сьогодні ${today.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      'Яка зараз година?': `Зараз ${today.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`,
      'Скільки днів до Нового Року?': `До Нового Року залишилося ${diffDays} днів, ${diffHours} годин, ${diffMinutes} хвилин, ${diffSeconds} секунд`,
    };
    return answers[question];
  };

  return (
    <>
      {isOpen ? (
        <div className="chat">
          <div className="chat-header">
            <button className="close-button" onClick={handleClose}>×</button>
          </div>
          <div className="chat-content">
            <div className="messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender === 'user' ? 'user-message' : 'chat-message'}`}
                >
                  {message.text}
                </div>
              ))}
              {isTyping && (
                <div className="typing">Typing...</div>
              )}
            </div>
            <div className="input-container">
              {selectedQuestion ? (
                selectedQuestion === 'Своє питання' ? (
                  <>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Введіть своє питання"
                    />
                    <button onClick={handleSendMessage}>Відправити</button>
                    <button onClick={handleBackToQuestions}>Назад до питань</button>
                  </>
                ) : (
                  <button onClick={handleBackToQuestions}>Назад до питань</button>
                )
              ) : (
                <div className="questions">
                  <button onClick={() => handleSelectQuestion('Який сьогодні день?')}>
                    Який сьогодні день?
                  </button>
                  <button onClick={() => handleSelectQuestion('Яка зараз година?')}>
                    Яка зараз година?
                  </button>
                  <button onClick={() => handleSelectQuestion('Скільки днів до Нового Року?')}>
                    Скільки днів до Нового Року?
                  </button>
                  <button onClick={() => handleSelectQuestion('Своє питання')}>
                    Своє питання
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button className="chat-icon" onClick={handleOpen}>
          💬
        </button>
      )}
    </>
  );
};

export default Chat;
