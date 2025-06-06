export interface ReportData {
  header: {
    date: string;
    shift: 'morning' | 'afternoon';
    supervisor: string;
    unit: string;
  };
  morning: {
    name: string;
    tested: number;
    approved: number;
    rejected: number;
    cleaned: number;
    resetados: number;
    v9: number;
  }[];
  afternoon: {
    name: string;
    v9: number;
    reset: number;
    cleaning: number;
    tested: number;
    cleaned: number;
    resetados: number;
  }[];
  summary: {
    totalTested: number;
    totalApproved: number;
    totalRejected: number;
    totalV9: number;
    totalReset: number;
    totalCleaning: number;
    totalEquipment: number;
    testedEquipment: number;
    cleanedEquipment: number;
    resetEquipment: number;
    v9Equipment: number;
    totalCollaborators: number;
    morningCollaborators: number;
    afternoonCollaborators: number;
  };
  observations: {
    issues: string;
    highlights: string;
    attentionPoints: string;
  };
} 