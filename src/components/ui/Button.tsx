import { styled, Button as TButton } from 'tamagui';

export const Button = styled(TButton, {
  borderRadius: '$3',
  variants: {
    variant: {
      primary: {
        backgroundColor: '$accent',
        color: '#fff',
        fontWeight: '600',
        pressStyle: { backgroundColor: '$accent', scale: 0.97 },
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$accent',
        color: '$accent',
        fontWeight: '600',
        pressStyle: { backgroundColor: 'rgba(168,85,247,0.1)', scale: 0.97 },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '$color',
        fontWeight: '600',
        pressStyle: { backgroundColor: 'rgba(255,255,255,0.05)' },
      },
    },
  } as const,
  defaultVariants: {
    variant: 'primary',
  },
});
