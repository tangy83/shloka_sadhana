/**
 * Button Component Tests
 * Shloka Sadhana - UI Library
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

// Mock haptics used inside Button
jest.mock('@/utils/haptics', () => ({ triggerHaptic: jest.fn() }));

describe('Button', () => {
  const onPressMock = jest.fn();

  beforeEach(() => {
    onPressMock.mockClear();
  });

  it('renders with children label text', () => {
    const { getByText } = render(
      <Button onPress={onPressMock}>Submit</Button>
    );
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <Button onPress={onPressMock}>Submit</Button>
    );
    fireEvent.press(getByText('Submit'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <Button onPress={onPressMock} disabled>
        Submit
      </Button>
    );
    fireEvent.press(getByRole('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading is true', () => {
    const { getByLabelText, queryByText } = render(
      <Button onPress={onPressMock} loading>
        Submit
      </Button>
    );
    expect(getByLabelText('Loading')).toBeTruthy();
    expect(queryByText('Submit')).toBeNull();
  });

  it('does not call onPress when loading is true', () => {
    const { getByRole } = render(
      <Button onPress={onPressMock} loading>
        Submit
      </Button>
    );
    fireEvent.press(getByRole('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  describe('variant rendering', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant without crashing`, () => {
        const { getByText } = render(
          <Button onPress={onPressMock} variant={variant}>
            {variant}
          </Button>
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });
  });

  describe('size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach((size) => {
      it(`renders ${size} size without crashing`, () => {
        const { getByText } = render(
          <Button onPress={onPressMock} size={size}>
            {size}
          </Button>
        );
        expect(getByText(size)).toBeTruthy();
      });
    });
  });
});
