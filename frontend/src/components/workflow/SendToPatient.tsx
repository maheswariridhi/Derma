import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";

// Define Treatment Plan interface
interface TreatmentPlan {
  diagnosis?: string;
  currentStatus?: string;
  medications?: { name: string }[];
}

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  treatmentPlan?: TreatmentPlan;
  communicationPreference?: {
    method: string;
    notes: string;
  };
  status?: string;
}

// Define context interface
interface OutletContext {
  patient: Patient;
  onComplete: (updatedPatient: Patient) => void;
}

const SendToPatient: React.FC = () => {
  const { patient, onComplete } = useOutletContext<OutletContext>();

  const [communicationMethod, setCommunicationMethod] = useState<"email" | "sms">("email");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const handleSubmit = () => {
    onComplete({
      ...patient,
      communicationPreference: {
        method: communicationMethod,
        notes: additionalNotes,
      },
      status: "Sent",
    });
  };

  return (
    <div className="space-y-6">
      {/* Communication Method */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Preferred Communication Method</Label>
        <RadioGroup
          value={communicationMethod}
          onValueChange={(value) => setCommunicationMethod(value as "email" | "sms")}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email" className="text-base">Email</Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="sms" id="sms" />
            <Label htmlFor="sms" className="text-base">SMS</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Treatment Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Treatment Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-slate-600">Diagnosis:</span>
            <span className="font-medium">{patient?.treatmentPlan?.diagnosis || "Not specified"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-slate-600">Status:</span>
            <span className="font-medium">{patient?.treatmentPlan?.currentStatus || "Not specified"}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-600">Medications:</span>
            <span className="font-medium">{patient?.treatmentPlan?.medications?.length ? 
              patient.treatmentPlan.medications.map(med => med.name).join(", ") : 
              "None prescribed"}</span>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-3">
        <Label htmlFor="notes" className="text-lg font-medium">Additional Notes</Label>
        <Textarea
          id="notes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Add any additional notes for the patient..."
          className="min-h-[120px] text-base"
        />
      </div>

      {/* Confirmation */}
      <div className="pt-4 border-t">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="confirm"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
          />
          <Label htmlFor="confirm" className="text-base">
            I confirm that all information is correct
          </Label>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isConfirmed}
        className={`w-full py-6 text-lg font-medium ${
          isConfirmed 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
            : 'bg-slate-100 text-slate-400'
        }`}
      >
        Send Report to Patient
      </Button>
    </div>
  );
};

export default SendToPatient;
