import { YStack, Text, XStack } from "tamagui";
import { useState, createElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registroSchema, type RegistroInput } from "@/schemas/registro.schema";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { getCategoryColor, todayISO, nowTime } from "@/lib/utils";
import { useImagePicker } from "@/hooks/useImagePicker";
import type { Category } from "@/types";

interface RegistroFormProps {
  onSubmit: (data: RegistroInput) => Promise<void>;
  loading?: boolean;
}

const categories = Object.entries(CATEGORY_CONFIG) as [
  Category,
  (typeof CATEGORY_CONFIG)[Category],
][];

const categoryOptions = categories.map(([key, cfg]) => ({
  label: cfg.label,
  value: key,
  icon: createElement(cfg.icon, { size: 18, color: getCategoryColor(key) }),
}));

export function RegistroForm({ onSubmit, loading }: RegistroFormProps) {
  const { pickAndUpload, uploading } = useImagePicker();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      category: "personal",
      title: "",
      body: "",
      event_date: todayISO(),
      event_time: nowTime(),
    },
  });

  const handlePickImage = async () => {
    if (photoUrls.length >= 3) return;
    const url = await pickAndUpload();
    if (url) setPhotoUrls((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: RegistroInput) => {
    await onSubmit({ ...data, photo_urls: photoUrls });
    reset();
    setPhotoUrls([]);
  };

  return (
    <YStack gap="$3">
      <Text color="$color" fontSize="$2" fontWeight="500">
        Categoria
      </Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange } }) => (
          <Select
            value={value}
            onValueChange={onChange}
            placeholder="Selecione a categoria"
            options={categoryOptions}
          />
        )}
      />

      <Text color="$color" fontSize="$2" fontWeight="500">
        Data do evento
      </Text>
      <Controller
        control={control}
        name="event_date"
        render={({ field: { value, onChange } }) => (
          <DateInput value={value} onChange={onChange} />
        )}
      />
      {errors.event_date && (
        <Text color="$error" fontSize="$1">
          {errors.event_date.message}
        </Text>
      )}

      <Text color="$color" fontSize="$2" fontWeight="500">
        Hora do evento
      </Text>
      <Controller
        control={control}
        name="event_time"
        render={({ field: { value, onChange } }) => (
          <TimeInput value={value} onChange={onChange} />
        )}
      />
      {errors.event_time && (
        <Text color="$error" fontSize="$1">
          {errors.event_time.message}
        </Text>
      )}

      <Text color="$color" fontSize="$2" fontWeight="500">
        Título
      </Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            placeholder="O que aconteceu?"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.title && (
        <Text color="$error" fontSize="$1">
          {errors.title.message}
        </Text>
      )}

      <Text color="$color" fontSize="$2" fontWeight="500">
        Descrição (opcional)
      </Text>
      <Controller
        control={control}
        name="body"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextArea
            placeholder="Conte mais detalhes..."
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Text color="$color" fontSize="$2" fontWeight="500">
        Fotos (até 3)
      </Text>
      {photoUrls.length > 0 && (
        <ImageCarousel
          images={photoUrls}
          editable
          onRemove={handleRemoveImage}
        />
      )}
      {photoUrls.length < 3 && (
        <Button
          variant="secondary"
          onPress={handlePickImage}
          disabled={uploading}
        >
          {uploading
            ? "Enviando..."
            : `📷 Adicionar foto (${photoUrls.length}/3)`}
        </Button>
      )}

      <Button
        variant="primary"
        onPress={handleSubmit(handleFormSubmit)}
        disabled={loading || uploading}
        marginTop="$2"
      >
        {loading ? "Salvando..." : "Salvar Registro"}
      </Button>
    </YStack>
  );
}
