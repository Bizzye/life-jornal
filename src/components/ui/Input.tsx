import { styled, Input as TInput } from 'tamagui';

export const Input = styled(TInput, {
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.10)',
  color: '$color',
  placeholderTextColor: 'rgba(245, 240, 232, 0.6)' as any,
  paddingHorizontal: '$3',
  height: 48,
  fontSize: '$3',
  focusStyle: {
    borderColor: '$accent',
  },
});
