'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Scale, Calculator, ArrowRight } from 'lucide-react';
import { basicCalculator } from '../../features/calculators/basic';

interface WeightCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeightCalculator: React.FC<WeightCalculatorProps> = ({ isOpen, onClose }) => {
  // Rod calculator state
  const [rodDiameter, setRodDiameter] = useState('16');
  const [rodLength, setRodLength] = useState('12');
  const [rodQty, setRodQty] = useState('100');
  const [rodResult, setRodResult] = useState<number | null>(null);

  // Sheet calculator state
  const [sheetThickness, setSheetThickness] = useState('2');
  const [sheetWidth, setSheetWidth] = useState('1.22');
  const [sheetLength, setSheetLength] = useState('2.44');
  const [sheetQty, setSheetQty] = useState('50');
  const [sheetResult, setSheetResult] = useState<number | null>(null);

  const calculateRods = () => {
    const dia = parseFloat(rodDiameter) || 0;
    const len = parseFloat(rodLength) || 0;
    const qty = parseFloat(rodQty) || 0;

    // Standard formula: Weight (kg) = dia^2 * 0.00617 * length * qty
    const singleWeight = basicCalculator.multiply(basicCalculator.multiply(dia, dia), 0.00617);
    const totalWeightKg = basicCalculator.multiply(basicCalculator.multiply(singleWeight, len), qty);
    setRodResult(basicCalculator.round(totalWeightKg, 2));
  };

  const calculateSheets = () => {
    const thick = parseFloat(sheetThickness) || 0;
    const w = parseFloat(sheetWidth) || 0;
    const l = parseFloat(sheetLength) || 0;
    const qty = parseFloat(sheetQty) || 0;

    // Standard formula: Weight (kg) = thickness * width * length * 7.85 * qty
    const area = basicCalculator.multiply(w, l);
    const volume = basicCalculator.multiply(thick, area);
    const totalWeightKg = basicCalculator.multiply(basicCalculator.multiply(volume, 7.85), qty);
    setSheetResult(basicCalculator.round(totalWeightKg, 2));
  };

  return (
    <div
      className={`fixed top-0 right-0 z-50 h-full w-96 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/15">
        <span className="flex items-center text-sm font-bold text-foreground font-mono">
          <Scale className="h-5 w-5 mr-2 text-primary" />
          <span>Weight Estimator Panel</span>
        </span>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
        <Tabs defaultValue="rods" className="w-full">
          <TabsList className="grid grid-cols-2 bg-secondary/20 p-1 rounded-lg">
            <TabsTrigger value="rods" className="text-xs font-semibold py-2">Iron Rods</TabsTrigger>
            <TabsTrigger value="sheets" className="text-xs font-semibold py-2">Steel Sheets</TabsTrigger>
          </TabsList>

          {/* Rods panel */}
          <TabsContent value="rods" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rod Diameter (mm)</Label>
              <Input
                type="number"
                value={rodDiameter}
                onChange={(e) => setRodDiameter(e.target.value)}
                placeholder="e.g. 16"
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Length per Rod (meters)</Label>
              <Input
                type="number"
                value={rodLength}
                onChange={(e) => setRodLength(e.target.value)}
                placeholder="e.g. 12"
                className="bg-background font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quantity (pcs)</Label>
              <Input
                type="number"
                value={rodQty}
                onChange={(e) => setRodQty(e.target.value)}
                placeholder="e.g. 100"
                className="bg-background font-mono"
              />
            </div>

            <Button onClick={calculateRods} className="w-full font-semibold space-x-1.5 py-5 mt-2">
              <Calculator className="h-4 w-4" />
              <span>Compute Rod Weight</span>
            </Button>

            {rodResult !== null && (
              <div className="bg-secondary/25 border border-border p-4 rounded-lg space-y-1 mt-4">
                <div className="text-xs text-muted-foreground font-mono">Estimated Result:</div>
                <div className="text-lg font-bold font-mono text-foreground">
                  {rodResult.toLocaleString()} kg
                </div>
                <div className="text-sm font-semibold text-muted-foreground font-mono">
                  {(rodResult / 1000).toFixed(3)} tons
                </div>
              </div>
            )}
          </TabsContent>

          {/* Sheets panel */}
          <TabsContent value="sheets" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Sheet Thickness (mm)</Label>
              <Input
                type="number"
                value={sheetThickness}
                onChange={(e) => setSheetThickness(e.target.value)}
                placeholder="e.g. 2"
                className="bg-background font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Width (m)</Label>
                <Input
                  type="number"
                  value={sheetWidth}
                  onChange={(e) => setSheetWidth(e.target.value)}
                  placeholder="e.g. 1.22"
                  className="bg-background font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Length (m)</Label>
                <Input
                  type="number"
                  value={sheetLength}
                  onChange={(e) => setSheetLength(e.target.value)}
                  placeholder="e.g. 2.44"
                  className="bg-background font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quantity (sheets)</Label>
              <Input
                type="number"
                value={sheetQty}
                onChange={(e) => setSheetQty(e.target.value)}
                placeholder="e.g. 50"
                className="bg-background font-mono"
              />
            </div>

            <Button onClick={calculateSheets} className="w-full font-semibold space-x-1.5 py-5 mt-2">
              <Calculator className="h-4 w-4" />
              <span>Compute Sheet Weight</span>
            </Button>

            {sheetResult !== null && (
              <div className="bg-secondary/25 border border-border p-4 rounded-lg space-y-1 mt-4">
                <div className="text-xs text-muted-foreground font-mono">Estimated Result:</div>
                <div className="text-lg font-bold font-mono text-foreground">
                  {sheetResult.toLocaleString()} kg
                </div>
                <div className="text-sm font-semibold text-muted-foreground font-mono">
                  {(sheetResult / 1000).toFixed(3)} tons
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
