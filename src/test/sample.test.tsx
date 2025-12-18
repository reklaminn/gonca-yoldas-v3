import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// A simple component for testing
const TestComponent = ({ message }: { message: string }) => (
  <div>{message}</div>
);

describe('Sanity Check', () => {
  it('should pass a basic truthy test', () => {
    expect(true).toBe(true);
  });

  it('should render a component correctly', () => {
    render(<TestComponent message="Hello Vitest!" />);
    expect(screen.getByText('Hello Vitest!')).toBeInTheDocument();
  });
});
