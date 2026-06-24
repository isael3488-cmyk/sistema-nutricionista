"use client";

import Script from "next/script";
import type { Patient } from "@/lib/patients";
import { useEffect, useMemo, useState } from "react";
import { usePatientAnamnesis } from "@/components/patients/use-patient-anamnesis";
import { usePatientBodyEvaluations } from "@/components/patients/use-patient-body-evaluations";
import { usePatientMealPlan } from "@/components/patients/use-patient-meal-plan";
import {
  formatDate,
  formatHeight,
  formatWeight,
  mealSlots,
} from "@/lib/patients";

declare global {
  interface Window {
    jspdf?: {
      jsPDF: new (options?: { unit?: string; format?: string }) => JsPdfDoc;
    };
  }
}

type JsPdfDoc = {
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
  setFont: (fontName: string, fontStyle?: string) => JsPdfDoc;
  setFontSize: (size: number) => JsPdfDoc;
  setTextColor: (value: number | string, g?: number, b?: number) => JsPdfDoc;
  setDrawColor: (value: number | string, g?: number, b?: number) => JsPdfDoc;
  setLineWidth: (value: number) => JsPdfDoc;
  line: (x1: number, y1: number, x2: number, y2: number) => JsPdfDoc;
  text: (
    text: string | string[],
    x: number,
    y: number,
    options?: { maxWidth?: number },
  ) => JsPdfDoc;
  addPage: () => JsPdfDoc;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  save: (fileName: string) => void;
  getNumberOfPages: () => number;
  setPage: (pageNumber: number) => JsPdfDoc;
  roundedRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    ry: number,
    style?: string,
  ) => JsPdfDoc;
  rect: (
    x: number,
    y: number,
    width: number,
    height: number,
    style?: string,
  ) => JsPdfDoc;
  setFillColor: (value: number | string, g?: number, b?: number) => JsPdfDoc;
};

type PatientPdfButtonProps = {
  patient: Patient;
  patientId: string;
};

export function PatientPdfButton({ patient, patientId }: Readonly<PatientPdfButtonProps>) {
  const { ready: anamnesisReady, anamnesis } = usePatientAnamnesis(patientId);
  const { ready: bodyReady, evaluations } = usePatientBodyEvaluations(patientId);
  const { ready: mealReady, mealPlan } = usePatientMealPlan(patientId);
  const [libReady, setLibReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.jspdf?.jsPDF) {
      setLibReady(true);
    }
  }, []);

  const pdfReady = useMemo(
    () => libReady && anamnesisReady && bodyReady && mealReady,
    [anamnesisReady, bodyReady, libReady, mealReady],
  );

  const handleGenerate = () => {
    if (!pdfReady || !window.jspdf?.jsPDF) {
      return;
    }

    setBusy(true);

    try {
      const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 5;
      let y = margin;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addHeader = () => {
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(margin, y, contentWidth, 24, 4, 4, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(`Paciente: ${patient.name}`, margin + 6, y + 9);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
          `Gerado em ${formatDate(new Date().toISOString())}`,
          margin + 6,
          y + 16,
        );
        y += 31;
        doc.setTextColor(15, 23, 42);
      };

      const addSectionTitle = (title: string) => {
        ensureSpace(14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(title, margin, y);
        y += 2;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 7;
      };

      const addParagraph = (label: string, value: string) => {
        const text = value?.trim() ? value : "Nao informado";
        const labelWidth = 48;
        const maxWidth = contentWidth - labelWidth;
        const wrapped = doc.splitTextToSize(text, maxWidth);
        ensureSpace(Math.max(8, wrapped.length * lineHeight + 1));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(wrapped, margin + labelWidth, y);
        y += wrapped.length * lineHeight + 1;
      };

      const addBlock = (title: string, value: string) => {
        const text = value?.trim() ? value : "Nao informado";
        const wrapped = doc.splitTextToSize(text, contentWidth - 8);
        ensureSpace(wrapped.length * lineHeight + 12);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, wrapped.length * lineHeight + 8, 3, 3, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, margin + 4, y + 6);
        doc.setFont("helvetica", "normal");
        doc.text(wrapped, margin + 4, y + 11);
        y += wrapped.length * lineHeight + 12;
      };

      addHeader();

      addSectionTitle("Dados do paciente");
      addParagraph("Nome", patient.name);
      addParagraph("Telefone", patient.phone);
      addParagraph("WhatsApp", patient.whatsapp);
      addParagraph("Email", patient.email);
      addParagraph("Data de nascimento", formatDate(patient.birthDate));
      addParagraph("Sexo", patient.sex);
      addParagraph("Altura", formatHeight(patient.heightCm));
      addParagraph("Peso atual", formatWeight(patient.currentWeightKg));
      addParagraph("Peso objetivo", formatWeight(patient.targetWeightKg));
      addParagraph("Objetivo", patient.objective);

      addSectionTitle("Anamnese");
      addBlock("Consumo de agua", anamnesis?.waterIntake ?? "");
      addBlock("Horas de sono", anamnesis?.sleepHours ?? "");
      addBlock("Frequencia de treino", anamnesis?.trainingFrequency ?? "");
      addBlock("Alergias", anamnesis?.allergies ?? "");
      addBlock("Intolerancias", anamnesis?.intolerances ?? "");
      addBlock("Medicamentos", anamnesis?.medications ?? "");
      addBlock("Doencas", anamnesis?.diseases ?? "");
      addBlock("Rotina alimentar", anamnesis?.foodRoutine ?? "");
      addBlock("Objetivo principal", anamnesis?.mainObjective ?? "");

      const latestEvaluation = evaluations[0];
      addSectionTitle("Avaliacao corporal");
      if (latestEvaluation) {
        addParagraph("Data da avaliacao", formatDate(latestEvaluation.evaluationDate));
        addParagraph("Peso", formatWeight(latestEvaluation.weightKg));
        addParagraph("Altura", formatHeight(latestEvaluation.heightCm));
        addParagraph(
          "IMC",
          latestEvaluation.bodyMassIndex.toFixed(1).replace(".", ","),
        );
        addParagraph(
          "Percentual de gordura",
          `${latestEvaluation.bodyFatPercentage.toFixed(1).replace(".", ",")}%`,
        );
        addParagraph(
          "Massa muscular",
          `${latestEvaluation.muscleMassKg.toFixed(1).replace(".", ",")} kg`,
        );
        addParagraph("Cintura", `${latestEvaluation.waistCm.toFixed(1).replace(".", ",")} cm`);
        addParagraph("Abdomen", `${latestEvaluation.abdomenCm.toFixed(1).replace(".", ",")} cm`);
        addParagraph("Quadril", `${latestEvaluation.hipCm.toFixed(1).replace(".", ",")} cm`);
        addParagraph(
          "Braco direito",
          `${latestEvaluation.rightArmCm.toFixed(1).replace(".", ",")} cm`,
        );
        addParagraph(
          "Braco esquerdo",
          `${latestEvaluation.leftArmCm.toFixed(1).replace(".", ",")} cm`,
        );
        addParagraph(
          "Coxa direita",
          `${latestEvaluation.rightThighCm.toFixed(1).replace(".", ",")} cm`,
        );
        addParagraph(
          "Coxa esquerda",
          `${latestEvaluation.leftThighCm.toFixed(1).replace(".", ",")} cm`,
        );

        if (evaluations.length > 1) {
          ensureSpace(20);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("Historico resumido", margin, y);
          y += 5;
          evaluations
            .slice(0, 5)
            .reverse()
            .forEach((item) => {
              addParagraph(
                formatDate(item.evaluationDate),
                `${formatWeight(item.weightKg)} | IMC ${item.bodyMassIndex
                  .toFixed(1)
                  .replace(".", ",")}`,
              );
            });
        }
      } else {
        addParagraph("Avaliacao", "Nenhuma avaliacao cadastrada.");
      }

      addSectionTitle("Plano alimentar");
      if (mealPlan) {
        mealSlots.forEach((slot) => {
          const items = mealPlan.meals[slot] ?? [];
          ensureSpace(16);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(slot, margin, y);
          y += 5;
          if (items.length === 0) {
            addParagraph("Itens", "Nenhum item cadastrado.");
            return;
          }

          items.forEach((item, index) => {
            addBlock(
              `${index + 1}. ${item.food || "Alimento nao informado"}`,
              [
                `Horario: ${item.time || "Nao informado"}`,
                `Quantidade: ${item.quantity || "Nao informada"}`,
                `Medida caseira: ${item.householdMeasure || "Nao informada"}`,
                `Observacao: ${item.observation || "Sem observacao"}`,
              ].join("\n"),
            );
          });
        });
      } else {
        addParagraph("Plano", "Nenhum plano alimentar cadastrado.");
      }

      addSectionTitle("Observacoes do nutricionista");
      addBlock(
        "Observacoes",
        patient.notes || "Sem observacoes do nutricionista cadastradas.",
      );

      const totalPages = doc.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `NutriSaaS - pagina ${page} de ${totalPages}`,
          margin,
          pageHeight - 8,
        );
      }

      const fileName = `paciente-${slugify(patient.name)}.pdf`;
      doc.save(fileName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
        strategy="afterInteractive"
        onLoad={() => setLibReady(true)}
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!pdfReady || busy}
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {busy ? "Gerando PDF..." : "Gerar PDF"}
      </button>
    </>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
