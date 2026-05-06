"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useForm,
  type FieldErrors,
  type Path,
  type UseFormRegister
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  defaultDiagnosticValues,
  saveDiagnostic,
  stageLabels,
  type DiagnosticFormValues
} from "@/lib/diagnostic";
import { useAuth } from "@/lib/auth";

type FieldName = Path<DiagnosticFormValues>;

const schema = z.object({
  founderName: z.string().min(2, "Укажи имя"),
  email: z.string().email("Нужен корректный email"),
  telegram: z.string().optional(),
  phone: z.string().optional(),
  consent: z.boolean().refine(Boolean, "Нужно согласие на обработку данных"),
  startupName: z.string().min(2, "Укажи название проекта"),
  description: z.string().min(30, "Опиши проект чуть подробнее"),
  website: z.string().optional(),
  industry: z.string().min(2, "Укажи отрасль"),
  city: z.string().optional(),
  clientType: z.string().min(1),
  businessModel: z.string().min(1),
  stage: z.enum(["idea", "prototype", "mvp", "traction", "revenue", "growth"]),
  revenueRange: z.string().min(1),
  teamSize: z.coerce.number().min(1, "Минимум 1 человек"),
  tractionSignals: z.array(z.string()).default([]),
  fundingNeedAmount: z.coerce.number().min(1, "Укажи ориентировочную сумму"),
  fundingNeedPurpose: z.string().min(12, "Коротко опиши цель финансирования"),
  preferredFundingTypes: z.array(z.string()).min(1, "Выбери хотя бы один формат"),
  previousFundingAttempts: z.string().optional(),
  preparedDocuments: z.array(z.string()).default([]),
  mainPain: z.string().min(10, "Опиши главную боль"),
  interviewInterest: z.string().min(1),
  paidReadiness: z.string().min(1)
});

const steps: Array<{
  title: string;
  description: string;
  fields: FieldName[];
}> = [
  {
    title: "Контакты",
    description: "Кому отправлять результат и как связаться для разбора.",
    fields: ["founderName", "email", "telegram", "phone", "consent"]
  },
  {
    title: "Проект",
    description: "Коротко фиксируем, что строим и для кого.",
    fields: [
      "startupName",
      "description",
      "website",
      "industry",
      "city",
      "clientType",
      "businessModel"
    ]
  },
  {
    title: "Стадия",
    description: "Понимаем зрелость продукта, команды и выручки.",
    fields: ["stage", "revenueRange", "teamSize"]
  },
  {
    title: "Спрос",
    description: "Собираем доказательства спроса и основную боль.",
    fields: ["tractionSignals", "mainPain"]
  },
  {
    title: "Капитал",
    description: "Фиксируем сумму, цель и предпочтительный формат денег.",
    fields: [
      "fundingNeedAmount",
      "fundingNeedPurpose",
      "preferredFundingTypes",
      "previousFundingAttempts"
    ]
  },
  {
    title: "Документы",
    description: "Проверяем готовность упаковки и интерес к разбору.",
    fields: ["preparedDocuments", "interviewInterest", "paidReadiness"]
  }
];

const clientTypeOptions = [
  ["b2b", "B2B"],
  ["b2c", "B2C"],
  ["b2g", "B2G"],
  ["marketplace", "Marketplace"]
];

const businessModelOptions = [
  ["saas", "SaaS"],
  ["transaction", "Комиссия"],
  ["hardware", "Hardware"],
  ["service", "Сервисная модель"],
  ["license", "Лицензия"]
];

const revenueOptions = [
  ["pre_revenue", "Пока нет выручки"],
  ["first_sales", "Первые продажи"],
  ["stable", "Стабильная выручка"],
  ["growing", "Выручка растет"]
];

const tractionOptions = [
  ["users", "Первые пользователи"],
  ["pilots", "Пилоты"],
  ["paying_customers", "Платящие клиенты"],
  ["loi", "LOI / письма интереса"],
  ["growth", "Рост метрик"],
  ["partners", "Партнерства"]
];

const fundingOptions = [
  ["grant", "Гранты"],
  ["accelerator", "Акселератор"],
  ["corporate", "Корпоративные пилоты / CVC"],
  ["vc", "Ангелы / VC"],
  ["debt", "Долг / краудлендинг"],
  ["not_sure", "Пока не знаю"]
];

const documentOptions = [
  ["pitch_deck", "Pitch deck"],
  ["one_pager", "One-pager"],
  ["financial_model", "Финмодель"],
  ["legal_entity", "Юрлицо"],
  ["cap_table", "Cap table"],
  ["customer_proof", "Подтверждения спроса"],
  ["data_room", "Data room"]
];

const interviewOptions = [
  ["yes", "Да, хочу разбор"],
  ["later", "Позже"],
  ["no", "Пока нет"]
];

const paidReadinessOptions = [
  ["yes", "Да"],
  ["maybe", "Зависит от ценности"],
  ["no", "Пока нет"]
];

type SummarySection = {
  title: string;
  items: Array<[string, string]>;
};

export function DiagnosticWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    trigger,
    formState: { errors },
    watch
  } = useForm<DiagnosticFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaultDiagnosticValues
  });

  const values = watch();
  const detailedSummary = useMemo(() => buildDetailedSummary(values), [values]);

  useEffect(() => {
    if (!user || user.role !== "founder") {
      return;
    }

    const current = getValues();
    if (current.founderName || current.email) {
      return;
    }

    reset({
      ...current,
      founderName: user.name,
      email: user.email
    });
  }, [getValues, reset, user]);

  async function goNext() {
    const isValid = await trigger(currentStep.fields, { shouldFocus: true });
    if (isValid) {
      setStepIndex((index) => Math.min(index + 1, steps.length - 1));
    }
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  const onSubmit = handleSubmit((formValues) => {
    setIsSaving(true);
    const diagnostic = saveDiagnostic(formValues);
    router.push(`/diagnostic/result/${diagnostic.id}`);
  });

  return (
    <section className="mt-8">
      <div className="grid gap-3 md:grid-cols-6">
        {steps.map((step, index) => {
          const isActive = stepIndex === index;
          const isDone = stepIndex > index;

          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setStepIndex(index)}
              className={`rounded border p-3 text-left transition ${
                isActive
                  ? "border-ink bg-ink text-white"
                  : isDone
                    ? "border-mint/40 bg-white text-ink"
                    : "border-ink/10 bg-white text-ink"
              }`}
            >
              <p className="text-xs opacity-70">Шаг {index + 1}</p>
              <p className="mt-1 text-sm font-medium">{step.title}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 h-2 rounded bg-ink/10">
        <div className="h-2 rounded bg-mint" style={{ width: `${progress}%` }} />
      </div>

      <form onSubmit={onSubmit} className="mt-8 rounded border border-ink/10 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              {currentStep.title}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {currentStep.description}
            </h2>
          </div>
        </div>

        <div className="mt-6">
          {stepIndex === 0 && <ContactStep register={register} errors={errors} />}
          {stepIndex === 1 && <ProjectStep register={register} errors={errors} />}
          {stepIndex === 2 && <StageStep register={register} errors={errors} />}
          {stepIndex === 3 && <TractionStep register={register} errors={errors} />}
          {stepIndex === 4 && <CapitalStep register={register} errors={errors} />}
          {stepIndex === 5 && <DocumentsStep register={register} errors={errors} />}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded border border-ink/15 px-4 py-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            Назад
          </button>

          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Дальше
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? <Check size={16} /> : <Send size={16} />}
              Получить результат
            </button>
          )}
        </div>
      </form>

      <details className="group mt-5 rounded border border-ink/10 bg-white p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel">
              Краткое summary
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              Что уже введено в анкету
            </h2>
          </div>
          <ChevronDown
            className="shrink-0 text-ink/55 transition group-open:rotate-180"
            size={22}
          />
        </summary>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {detailedSummary.map((section) => (
            <section key={section.title} className="rounded border border-ink/10 p-4">
              <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
              <dl className="mt-4 grid gap-3">
                {section.items.map(([label, value]) => (
                  <div key={label} className="grid gap-1">
                    <dt className="text-xs uppercase tracking-wide text-ink/45">
                      {label}
                    </dt>
                    <dd className="text-sm leading-6 text-ink/75">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </details>
    </section>
  );
}

function ContactStep({
  register,
  errors
}: {
  register: UseFormRegister<DiagnosticFormValues>;
  errors: FieldErrors<DiagnosticFormValues>;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <TextField label="Имя" name="founderName" register={register} error={errors.founderName?.message} />
      <TextField label="Email" name="email" register={register} error={errors.email?.message} />
      <TextField label="Telegram" name="telegram" register={register} />
      <TextField label="Телефон" name="phone" register={register} />
      <label className="flex items-start gap-3 rounded border border-ink/10 p-4 text-sm text-ink/75 md:col-span-2">
        <input type="checkbox" className="mt-1" {...register("consent")} />
        <span>
          Согласен на обработку персональных данных и получение информационного
          отчета.
          {errors.consent?.message && (
            <span className="mt-1 block text-sm font-medium text-red-600">
              {errors.consent.message}
            </span>
          )}
        </span>
      </label>
    </div>
  );
}

function ProjectStep({
  register,
  errors
}: {
  register: UseFormRegister<DiagnosticFormValues>;
  errors: FieldErrors<DiagnosticFormValues>;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <TextField label="Название проекта" name="startupName" register={register} error={errors.startupName?.message} />
      <TextField label="Отрасль" name="industry" register={register} error={errors.industry?.message} />
      <TextField label="Сайт" name="website" register={register} />
      <TextField label="Город" name="city" register={register} />
      <SelectField label="Тип клиента" name="clientType" register={register} options={clientTypeOptions} />
      <SelectField label="Бизнес-модель" name="businessModel" register={register} options={businessModelOptions} />
      <TextareaField
        label="Краткое описание"
        name="description"
        register={register}
        error={errors.description?.message}
      />
    </div>
  );
}

function StageStep({
  register,
  errors
}: {
  register: UseFormRegister<DiagnosticFormValues>;
  errors: FieldErrors<DiagnosticFormValues>;
}) {
  return (
    <div className="grid gap-6">
      <RadioCards
        label="Стадия"
        name="stage"
        register={register}
        options={Object.entries(stageLabels)}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Выручка"
          name="revenueRange"
          register={register}
          options={revenueOptions}
        />
        <NumberField
          label="Размер команды"
          name="teamSize"
          register={register}
          error={errors.teamSize?.message}
        />
      </div>
    </div>
  );
}

function TractionStep({
  register,
  errors
}: {
  register: UseFormRegister<DiagnosticFormValues>;
  errors: FieldErrors<DiagnosticFormValues>;
}) {
  return (
    <div className="grid gap-6">
      <CheckboxGrid
        label="Какие сигналы уже есть"
        name="tractionSignals"
        register={register}
        options={tractionOptions}
      />
      <TextareaField
        label="Главная боль сейчас"
        name="mainPain"
        register={register}
        error={errors.mainPain?.message}
      />
    </div>
  );
}

function CapitalStep({
  register,
  errors
}: {
  register: UseFormRegister<DiagnosticFormValues>;
  errors: FieldErrors<DiagnosticFormValues>;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <NumberField
          label="Нужная сумма, RUB"
          name="fundingNeedAmount"
          register={register}
          error={errors.fundingNeedAmount?.message}
        />
        <TextField
          label="Предыдущие попытки привлечения"
          name="previousFundingAttempts"
          register={register}
        />
      </div>
      <CheckboxGrid
        label="Какие форматы интересны"
        name="preferredFundingTypes"
        register={register}
        options={fundingOptions}
        error={errors.preferredFundingTypes?.message}
      />
      <TextareaField
        label="На что нужны деньги"
        name="fundingNeedPurpose"
        register={register}
        error={errors.fundingNeedPurpose?.message}
      />
    </div>
  );
}

function DocumentsStep({
  register,
  errors
}: {
  register: UseFormRegister<DiagnosticFormValues>;
  errors: FieldErrors<DiagnosticFormValues>;
}) {
  return (
    <div className="grid gap-6">
      <CheckboxGrid
        label="Что уже готово"
        name="preparedDocuments"
        register={register}
        options={documentOptions}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Интерес к экспертному разбору"
          name="interviewInterest"
          register={register}
          options={interviewOptions}
        />
        <SelectField
          label="Готовность к платному формату"
          name="paidReadiness"
          register={register}
          options={paidReadinessOptions}
        />
      </div>
      {errors.preparedDocuments?.message && (
        <p className="text-sm font-medium text-red-600">
          {errors.preparedDocuments.message}
        </p>
      )}
    </div>
  );
}

function TextField({
  label,
  name,
  register,
  error
}: {
  label: string;
  name: FieldName;
  register: UseFormRegister<DiagnosticFormValues>;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <input className="rounded border border-ink/15 px-3 py-3" {...register(name)} />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </label>
  );
}

function NumberField({
  label,
  name,
  register,
  error
}: {
  label: string;
  name: FieldName;
  register: UseFormRegister<DiagnosticFormValues>;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <input
        type="number"
        className="rounded border border-ink/15 px-3 py-3"
        {...register(name, { valueAsNumber: true })}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </label>
  );
}

function TextareaField({
  label,
  name,
  register,
  error
}: {
  label: string;
  name: FieldName;
  register: UseFormRegister<DiagnosticFormValues>;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink md:col-span-2">
      {label}
      <textarea className="min-h-28 rounded border border-ink/15 px-3 py-3" {...register(name)} />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </label>
  );
}

function SelectField({
  label,
  name,
  register,
  options
}: {
  label: string;
  name: FieldName;
  register: UseFormRegister<DiagnosticFormValues>;
  options: string[][];
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <select className="rounded border border-ink/15 px-3 py-3" {...register(name)}>
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function RadioCards({
  label,
  name,
  register,
  options
}: {
  label: string;
  name: FieldName;
  register: UseFormRegister<DiagnosticFormValues>;
  options: string[][];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {options.map(([value, optionLabel]) => (
          <label key={value} className="flex items-center gap-3 rounded border border-ink/10 p-4 text-sm font-medium text-ink">
            <input type="radio" value={value} {...register(name)} />
            {optionLabel}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGrid({
  label,
  name,
  register,
  options,
  error
}: {
  label: string;
  name: FieldName;
  register: UseFormRegister<DiagnosticFormValues>;
  options: string[][];
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {options.map(([value, optionLabel]) => (
          <label key={value} className="flex items-center gap-3 rounded border border-ink/10 p-4 text-sm font-medium text-ink">
            <input type="checkbox" value={value} {...register(name)} />
            {optionLabel}
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </fieldset>
  );
}

function formatRub(value?: number) {
  if (!value || Number.isNaN(value)) {
    return "Не указана";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(value);
}

function buildDetailedSummary(values: DiagnosticFormValues): SummarySection[] {
  return [
    {
      title: "Контакты",
      items: [
        ["Фаундер", formatText(values.founderName)],
        ["Email", formatText(values.email)],
        ["Telegram", formatText(values.telegram)],
        ["Телефон", formatText(values.phone)]
      ]
    },
    {
      title: "Проект",
      items: [
        ["Название", formatText(values.startupName)],
        ["Отрасль", formatText(values.industry)],
        ["Город", formatText(values.city)],
        ["Сайт", formatText(values.website)],
        ["Тип клиента", formatOption(values.clientType, clientTypeOptions)],
        ["Бизнес-модель", formatOption(values.businessModel, businessModelOptions)],
        ["Описание", formatText(values.description)]
      ]
    },
    {
      title: "Стадия и спрос",
      items: [
        ["Стадия", stageLabels[values.stage] ?? "Не указано"],
        ["Выручка", formatOption(values.revenueRange, revenueOptions)],
        ["Команда", values.teamSize ? `${values.teamSize} чел.` : "Не указано"],
        ["Сигналы", formatOptionList(values.tractionSignals, tractionOptions)],
        ["Главная боль", formatText(values.mainPain)]
      ]
    },
    {
      title: "Капитал и документы",
      items: [
        ["Сумма", formatRub(values.fundingNeedAmount)],
        ["Цель финансирования", formatText(values.fundingNeedPurpose)],
        ["Интересные форматы", formatOptionList(values.preferredFundingTypes, fundingOptions)],
        ["Предыдущие попытки", formatText(values.previousFundingAttempts)],
        ["Готовые документы", formatOptionList(values.preparedDocuments, documentOptions)],
        ["Экспертный разбор", formatOption(values.interviewInterest, interviewOptions)],
        ["Платный формат", formatOption(values.paidReadiness, paidReadinessOptions)]
      ]
    }
  ];
}

function formatText(value?: string) {
  return value?.trim() || "Не указано";
}

function formatOption(value: string | undefined, options: string[][]) {
  if (!value) {
    return "Не указано";
  }

  return options.find(([optionValue]) => optionValue === value)?.[1] ?? value;
}

function formatOptionList(values: string[] | undefined, options: string[][]) {
  if (!values || values.length === 0) {
    return "Не указано";
  }

  return values.map((value) => formatOption(value, options)).join(", ");
}
