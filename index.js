const express = require('express');
const app = express();

const MAX_HISTORY_LENGTH = 20;
const history = [];

// Helper function to perform operations
const calculate = (num1, operator, num2) => {
  switch (operator) {
    case 'plus':
      return num1 + num2;
    case 'minus':
      return num1 - num2;
    case 'into':
      return num1 * num2;
    case 'over':
      return num1 / num2;
    default:
      throw new Error('Invalid operator');
  }
};

// Helper function to format expression
const formatExpression = (num1, operator, num2, operator2, num3) => {
  let expression = `${num1} ${operator} ${num2}`;
  if (operator2 && num3) {
    expression += ` ${operator2} ${num3}`;
  }
  return expression;
};

app.get('/', (req, res) => {
  const endpoints = [
    { path: '/', description: 'Lists all the available endpoints.' },
    { path: '/history', description: 'Lists the last 20 operations performed on the server.' },
    { path: '/5/plus/3', description: 'Performs 5 + 3', response: { question: '5 + 3', answer: 8 } },
    { path: '/3/minus/5', description: 'Performs 3 - 5', response: { question: '3 - 5', answer: -2 } },
    { path: '/3/minus/5/plus/8', description: 'Performs 3 - 5 + 8', response: { question: '3 - 5 + 8', answer: 6 } },
    { path: '/3/into/5/plus/8/into/6', description: 'Performs 3 * 5 + 8 * 6', response: { question: '3 * 5 + 8 * 6', answer: 63 } }
    // ... you can add more endpoints here
  ];

  const endpointHTML = endpoints.map(endpoint => {
    return `<li><strong>${endpoint.path}</strong>: ${endpoint.description}</li>`;
  }).join('');

  const html = `
    <h1>Math Server Endpoints</h1>
    <ul>
      ${endpointHTML}
    </ul>
  `;

  res.send(html);
});

app.get('/history', (req, res) => {
  res.json(history);
});

app.get('/:num1/:operator/:num2/:operator2?/:num3?', (req, res) => {
  const { num1, operator, num2, operator2, num3 } = req.params;

  try {
    const parsedNum1 = parseFloat(num1);
    const parsedNum2 = parseFloat(num2);
    const parsedNum3 = parseFloat(num3);

    if (isNaN(parsedNum1) || isNaN(parsedNum2) || (num3 && isNaN(parsedNum3))) {
      throw new Error('Invalid number');
    }

    const answer = calculate(parsedNum1, operator, parsedNum2);

    if (operator2 && num3) {
      const secondResult = calculate(answer, operator2, parsedNum3);
      const question = formatExpression(num1, operator, num2, operator2, num3);
      history.push({ question, answer: secondResult });
    } else {
      const question = formatExpression(num1, operator, num2);
      history.push({ question, answer });
    }

    if (history.length > MAX_HISTORY_LENGTH) {
      history.shift();
    }

    res.json({ question: formatExpression(num1, operator, num2, operator2, num3), answer });
  } catch (error) {
    res.status(400).json({ error: 'Invalid operation' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
