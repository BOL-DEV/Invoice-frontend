'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { X, Scale, Calculator, Copy, Check, RotateCcw, Layers } from 'lucide-react';
import { basicCalculator } from '../../features/calculators/basic';

interface WeightCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_ROD_DIAMETERS = ['10', '12', '16', '20', '25', '32'];
const COMMON_SHEET_THICKNESSES = ['1.0', '1.5', '2.0', '3.0', '4.0', '5.0', '6.0'];

export const WeightCalculator: React.FC<WeightCalculatorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rods' | 'sheets'>('rods');
  const [copied, setCopied] = useState(false);

  // Rod calculator state
  const [rodDiameter, setRodDiameter] = useState('16');
  const [rodLength, setRodLength] = useState('12');
  const [rodQty, setRodQty] = useState('100');
  const [rodResult, setRodResult] = useState<{ totalKg: number; singleKg: number } | null>(null);

  // Sheet calculator state
  const [sheetThickness, setSheetThickness] = useState('2');
  const [sheetWidth, setSheetWidth] = useState('1.22');
  const [sheetLength, setSheetLength] = useState('2.44');
  const [sheetQty, setSheetQty] = useState('50');
  const [sheetResult, setSheetResult] = useState<{ totalKg: number; singleKg: number } | null>(null);

  const calculateRods = () => {
    const dia = parseFloat(rodDiameter) || 0;
    const len = parseFloat(rodLength) || 0;
    const qty = parseFloat(rodQty) || 0;

    if (dia <= 0 || len <= 0 || qty <= 0) {
      setRodResult(null);
      return;
    }

    // Standard formula: Weight (kg) = dia^2 * 0.00617 * length * qty
    const singleWeight = basicCalculator.multiply(basicCalculator.multiply(dia, dia), 0.00617);
    const unitWeight = basicCalculator.multiply(singleWeight, len);
    const totalWeightKg = basicCalculator.multiply(unitWeight, qty);

    setRodResult({
      totalKg: basicCalculator.round(totalWeightKg, 2),
      singleKg: basicCalculator.round(unitWeight, 2),
    });
  };

  const calculateSheets = () => {
    const thick = parseFloat(sheetThickness) || 0;
    const w = parseFloat(sheetWidth) || 0;
    const l = parseFloat(sheetLength) || 0;
    const qty = parseFloat(sheetQty) || 0;

    if (thick <= 0 || w <= 0 || l <= 0 || qty <= 0) {
      setSheetResult(null);
      return;
    }

    // Standard formula: Weight (kg) = thickness (mm) * width (m) * length (m) * 7.85 * qty
    const area = basicCalculator.multiply(w, l);
    const volume = basicCalculator.multiply(thick, area);
    const unitWeight = basicCalculator.multiply(volume, 7.85);
    const totalWeightKg = basicCalculator.multiply(unitWeight, qty);

    setSheetResult({
      totalKg: basicCalculator.round(totalWeightKg, 2),
      singleKg: basicCalculator.round(unitWeight, 2),
    });
  };

  // Auto-calculate on initial load or inputs change
  useEffect(() => {
    if (activeTab === 'rods') calculateRods();
  }, [rodDiameter, rodLength, rodQty, activeTab]);

  useEffect(() => {
    if (activeTab === 'sheets') calculateSheets();
  }, [sheetThickness, sheetWidth, sheetLength, sheetQty, activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-foreground">
                  Metal Weight Estimator
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Calculate standard rebar & steel plate weights
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Segmented Tab Selector */}
          <div className="px-6 pt-5 pb-2">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-secondary/40 border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('rods')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'rods'
                    ? 'bg-background text-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Scale className="h-3.5 w-3.5 text-emerald-500" />
                <span>Iron Rods (TMT)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sheets')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'sheets'
                    ? 'bg-background text-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-sky-500" />
                <span>Steel Sheets / Plates</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {activeTab === 'rods' ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Rod Diameter with Quick Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Rod Diameter (mm)</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">Standard sizes</span>
                  </div>
                  <Input
                    type="number"
                    step="any"
                    value={rodDiameter}
                    onChange={(e) => setRodDiameter(e.target.value)}
                    placeholder="e.g. 16"
                    className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COMMON_ROD_DIAMETERS.map((dia) => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => setRodDiameter(dia)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          rodDiameter === dia
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold'
                            : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        {dia}mm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length & Quantity in 2 cols */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Length (m)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={rodLength}
                      onChange={(e) => setRodLength(e.target.value)}
                      placeholder="12"
                      className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                    />
                    <span className="text-[10px] text-muted-foreground">Default standard: 12m</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Quantity (pcs)</Label>
                    <Input
                      type="number"
                      value={rodQty}
                      onChange={(e) => setRodQty(e.target.value)}
                      placeholder="100"
                      className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                    />
                    <span className="text-[10px] text-muted-foreground">Number of rods</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={calculateRods}
                  className="w-full h-10 rounded-xl font-semibold text-xs space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 cursor-pointer mt-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Compute Rod Weight</span>
                </Button>

                {/* Result Card */}
                {rodResult && (
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-emerald-500/30 space-y-3 mt-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Estimated Rebar Weight
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(`${rodResult.totalKg.toLocaleString()} kg (${(rodResult.totalKg / 1000).toFixed(3)} tons)`)}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">TOTAL WEIGHT (KG)</span>
                        <span className="text-xl font-bold font-mono text-emerald-500">
                          {rodResult.totalKg.toLocaleString()} <span className="text-xs text-muted-foreground font-sans">kg</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">METRIC TONS</span>
                        <span className="text-xl font-bold font-mono text-foreground">
                          {(rodResult.totalKg / 1000).toFixed(3)} <span className="text-xs text-muted-foreground font-sans">tons</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-mono flex justify-between">
                      <span>Unit weight per {rodLength || 12}m rod:</span>
                      <strong className="text-foreground">{rodResult.singleKg.toLocaleString()} kg</strong>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Sheet Thickness with Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Sheet Thickness (mm)</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">Standard gauge</span>
                  </div>
                  <Input
                    type="number"
                    step="any"
                    value={sheetThickness}
                    onChange={(e) => setSheetThickness(e.target.value)}
                    placeholder="e.g. 2"
                    className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COMMON_SHEET_THICKNESSES.map((thick) => (
                      <button
                        key={thick}
                        type="button"
                        onClick={() => setSheetThickness(thick)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          sheetThickness === thick
                            ? 'bg-sky-500/10 text-sky-500 border-sky-500/30 font-bold'
                            : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        {thick}mm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width & Length */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Width (m)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={sheetWidth}
                      onChange={(e) => setSheetWidth(e.target.value)}
                      placeholder="1.22"
                      className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                    />
                    <span className="text-[10px] text-muted-foreground">Standard 4ft = 1.22m</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Length (m)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={sheetLength}
                      onChange={(e) => setSheetLength(e.target.value)}
                      placeholder="2.44"
                      className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                    />
                    <span className="text-[10px] text-muted-foreground">Standard 8ft = 2.44m</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">Quantity (sheets)</Label>
                  <Input
                    type="number"
                    value={sheetQty}
                    onChange={(e) => setSheetQty(e.target.value)}
                    placeholder="50"
                    className="h-10 rounded-xl bg-background font-mono text-sm px-3.5 border-border"
                  />
                </div>

                <Button
                  type="button"
                  onClick={calculateSheets}
                  className="w-full h-10 rounded-xl font-semibold text-xs space-x-2 bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 cursor-pointer mt-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Compute Sheet Weight</span>
                </Button>

                {/* Result Card */}
                {sheetResult && (
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-sky-500/30 space-y-3 mt-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Estimated Plate Weight
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(`${sheetResult.totalKg.toLocaleString()} kg (${(sheetResult.totalKg / 1000).toFixed(3)} tons)`)}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copied ? <Check className="h-3 w-3 text-sky-500 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">TOTAL WEIGHT (KG)</span>
                        <span className="text-xl font-bold font-mono text-sky-500">
                          {sheetResult.totalKg.toLocaleString()} <span className="text-xs text-muted-foreground font-sans">kg</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">METRIC TONS</span>
                        <span className="text-xl font-bold font-mono text-foreground">
                          {(sheetResult.totalKg / 1000).toFixed(3)} <span className="text-xs text-muted-foreground font-sans">tons</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-mono flex justify-between">
                      <span>Unit weight per sheet ({sheetWidth}m × {sheetLength}m):</span>
                      <strong className="text-foreground">{sheetResult.singleKg.toLocaleString()} kg</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Density: Steel 7.85 g/cm³ • TMT D²×0.00617
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 rounded-xl text-xs px-3 border-border cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
