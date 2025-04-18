import React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Treatment } from "@/services/TreatmentService";
import { Medicine } from "@/services/MedicineService";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "treatment" | "medicine";
  onSubmit: (data: Treatment | Medicine) => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  type,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onFormSubmit = (data: any) => {
    // Convert numeric fields from string to number
    if (type === "treatment") {
      data.duration = Number(data.duration);
      data.price = Number(data.price);
    } else {
      data.price = Number(data.price);
      data.stock = Number(data.stock);
    }
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add New {type === "treatment" ? "Treatment" : "Medicine"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder={`Enter ${type === "treatment" ? "treatment" : "medicine"} name`}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              placeholder={`Enter ${type === "treatment" ? "treatment" : "medicine"} description`}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message as string}
              </p>
            )}
          </div>

          {type === "treatment" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register("duration", {
                    required: "Duration is required",
                    min: { value: 1, message: "Duration must be at least 1 minute" },
                  })}
                  placeholder="Enter duration in minutes"
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">
                    {errors.duration.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register("category", { required: "Category is required" })}
                  placeholder="Enter treatment category"
                />
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message as string}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  {...register("dosage", { required: "Dosage is required" })}
                  placeholder="Enter medicine dosage"
                />
                {errors.dosage && (
                  <p className="text-sm text-destructive">
                    {errors.dosage.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  {...register("unit", { required: "Unit is required" })}
                  placeholder="Enter unit (e.g., tablets, ml)"
                />
                {errors.unit && (
                  <p className="text-sm text-destructive">
                    {errors.unit.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register("stock", {
                    required: "Stock is required",
                    min: { value: 0, message: "Stock cannot be negative" },
                  })}
                  placeholder="Enter stock quantity"
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price cannot be negative" },
              })}
              placeholder="Enter price"
            />
            {errors.price && (
              <p className="text-sm text-destructive">
                {errors.price.message as string}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add {type === "treatment" ? "Treatment" : "Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal; 