import { render } from '@testing-library/react';

import Wysiwyg from './wysiwyg';

describe('Wysiwyg', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Wysiwyg />);
    expect(baseElement).toBeTruthy();
  });
});
