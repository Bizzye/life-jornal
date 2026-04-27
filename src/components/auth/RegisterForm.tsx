import { YStack, Text } from "tamagui";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface RegisterFormProps {
  onSubmit: (data: RegisterInput) => Promise<void>;
  loading?: boolean;
}

export function RegisterForm({ onSubmit, loading }: RegisterFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <YStack gap="$3">
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            placeholder="Nome"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.name && (
        <Text color="$error" fontSize="$1">
          {errors.name.message}
        </Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && (
        <Text color="$error" fontSize="$1">
          {errors.email.message}
        </Text>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            placeholder="Senha (mín. 6 caracteres)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
          />
        )}
      />
      {errors.password && (
        <Text color="$error" fontSize="$1">
          {errors.password.message}
        </Text>
      )}

      <Button
        variant="primary"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        marginTop="$2"
      >
        {loading ? "Criando conta..." : "Criar Conta"}
      </Button>
    </YStack>
  );
}
