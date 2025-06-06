import { render, screen } from '@testing-library/react';

// Simple test component
function TestComponent() {
  return <div>Hello, Test!</div>;
}

describe('Example Test', () => {
  it('renders test component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello, Test!')).toBeInTheDocument();
  });
}); 