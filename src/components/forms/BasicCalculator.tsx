'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { X, GripVertical } from 'lucide-react';

interface BasicCalculatorProps {
  onClose: () => void;
}

export const BasicCalculator: React.FC<BasicCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  
  // Drag state
  const [position, setPosition] = useState({ x: 100, y: 150 });
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  const handleDigit = (digit: string) => {
    if (display === '0' || isFinished) {
      setDisplay(digit);
      setIsFinished(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (isFinished) {
      setDisplay('0.');
      setIsFinished(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
    setIsFinished(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsFinished(false);
  };

  const handleEvaluate = () => {
    if (!equation) return;
    const parts = equation.split(' ');
    const num1 = parseFloat(parts[0]);
    const op = parts[1];
    const num2 = parseFloat(display);

    let result = 0;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*') result = num1 * num2;
    else if (op === '/') result = num2 !== 0 ? num1 / num2 : 0;

    setDisplay(String(Number(result.toFixed(8))));
    setEquation('');
    setIsFinished(true);
  };

  return (
    <div
      ref={dragRef}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 w-72 bg-card border border-border rounded-xl shadow-2xl select-none cursor-default"
    >
      {/* Draggable header title bar */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-3 bg-secondary/30 rounded-t-xl cursor-grab active:cursor-grabbing border-b border-border"
      >
        <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          <GripVertical className="h-4 w-4 mr-1 text-muted-foreground/60 shrink-0" />
          <span>Calculator</span>
        </span>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Output values displays */}
        <div className="bg-background rounded-lg border border-border p-3 text-right">
          <div className="text-xs text-muted-foreground font-mono min-h-4">{equation}</div>
          <div className="text-2xl font-bold font-mono text-foreground truncate">{display}</div>
        </div>

        {/* Buttons grid matrix */}
        <div className="grid grid-cols-4 gap-2 font-mono">
          <Button variant="outline" onClick={handleClear} className="col-span-2 text-rose-500 font-semibold">C</Button>
          <Button variant="outline" onClick={() => handleOperator('/')}>/</Button>
          <Button variant="outline" onClick={() => handleOperator('*')}>*</Button>

          <Button variant="secondary" onClick={() => handleDigit('7')}>7</Button>
          <Button variant="secondary" onClick={() => handleDigit('8')}>8</Button>
          <Button variant="secondary" onClick={() => handleDigit('9')}>9</Button>
          <Button variant="outline" onClick={() => handleOperator('-')}>-</Button>

          <Button variant="secondary" onClick={() => handleDigit('4')}>4</Button>
          <Button variant="secondary" onClick={() => handleDigit('5')}>5</Button>
          <Button variant="secondary" onClick={() => handleDigit('6')}>6</Button>
          <Button variant="outline" onClick={() => handleOperator('+')}>+</Button>

          <Button variant="secondary" onClick={() => handleDigit('1')}>1</Button>
          <Button variant="secondary" onClick={() => handleDigit('2')}>2</Button>
          <Button variant="secondary" onClick={() => handleDigit('3')}>3</Button>
          <Button variant="default" onClick={handleEvaluate} className="row-span-2 h-full bg-primary text-primary-foreground font-bold">=</Button>

          <Button variant="secondary" onClick={() => handleDigit('0')} className="col-span-2">0</Button>
          <Button variant="secondary" onClick={handleDecimal}>.</Button>
        </div>
      </div>
    </div>
  );
};
