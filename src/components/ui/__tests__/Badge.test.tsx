/**
 * Badge Component Tests
 * Shloka Sadhana - UI Library
 */

import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders with text content', () => {
    const { getByText } = render(<Badge>Active</Badge>);
    expect(getByText('Active')).toBeTruthy();
  });

  describe('variant colors', () => {
    const variants = [
      'primary',
      'success',
      'error',
      'warning',
      'info',
      'neutral',
    ] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant without crashing`, () => {
        const { getByText } = render(
          <Badge variant={variant}>{variant}</Badge>
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });

    it('primary variant text color is white', () => {
      const { getByText } = render(<Badge variant="primary">Primary</Badge>);
      const textEl = getByText('Primary');
      const styles = textEl.props.style;
      const flat = Array.isArray(styles)
        ? Object.assign({}, ...styles.filter(Boolean))
        : styles;
      expect(flat.color).toBe('#FFFFFF');
    });

    it('success variant text color is white', () => {
      const { getByText } = render(<Badge variant="success">Success</Badge>);
      const textEl = getByText('Success');
      const styles = textEl.props.style;
      const flat = Array.isArray(styles)
        ? Object.assign({}, ...styles.filter(Boolean))
        : styles;
      expect(flat.color).toBe('#FFFFFF');
    });

    it('error variant text color is white', () => {
      const { getByText } = render(<Badge variant="error">Error</Badge>);
      const textEl = getByText('Error');
      const styles = textEl.props.style;
      const flat = Array.isArray(styles)
        ? Object.assign({}, ...styles.filter(Boolean))
        : styles;
      expect(flat.color).toBe('#FFFFFF');
    });

    it('warning variant text color is black', () => {
      const { getByText } = render(<Badge variant="warning">Warning</Badge>);
      const textEl = getByText('Warning');
      const styles = textEl.props.style;
      const flat = Array.isArray(styles)
        ? Object.assign({}, ...styles.filter(Boolean))
        : styles;
      expect(flat.color).toBe('#000000');
    });

    it('info variant text color is white', () => {
      const { getByText } = render(<Badge variant="info">Info</Badge>);
      const textEl = getByText('Info');
      const styles = textEl.props.style;
      const flat = Array.isArray(styles)
        ? Object.assign({}, ...styles.filter(Boolean))
        : styles;
      expect(flat.color).toBe('#FFFFFF');
    });
  });

  describe('size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach((size) => {
      it(`renders ${size} size without crashing`, () => {
        const { getByText } = render(
          <Badge size={size}>{size}</Badge>
        );
        expect(getByText(size)).toBeTruthy();
      });
    });
  });

  it('applies custom backgroundColor: container has correct backgroundColor', () => {
    // The Badge container View has accessibilityRole="text", so getAllByRole
    // returns [containerView, textNode]. The container is the first element.
    const { getAllByRole } = render(
      <Badge backgroundColor="#FF00FF">Custom</Badge>
    );
    const elements = getAllByRole('text');
    // The first element with role="text" is the View container
    const containerEl = elements[0];
    const styles = containerEl.props.style;
    const flat = Array.isArray(styles)
      ? Object.assign({}, ...styles.filter(Boolean))
      : styles;
    expect(flat.backgroundColor).toBe('#FF00FF');
  });

  it('applies custom textColor overriding variant default', () => {
    const { getByText } = render(
      <Badge textColor="#123456">Custom Color</Badge>
    );
    const textEl = getByText('Custom Color');
    const styles = textEl.props.style;
    const flat = Array.isArray(styles)
      ? Object.assign({}, ...styles.filter(Boolean))
      : styles;
    expect(flat.color).toBe('#123456');
  });

  it('renders icon prop alongside text', () => {
    const { getByText } = render(
      <Badge icon={<Text testID="badge-icon">🔥</Text>}>15 Day Streak</Badge>
    );
    expect(getByText('15 Day Streak')).toBeTruthy();
    expect(getByText('🔥')).toBeTruthy();
  });
});
