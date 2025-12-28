import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // With no auth token, the app should show the login form.
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
