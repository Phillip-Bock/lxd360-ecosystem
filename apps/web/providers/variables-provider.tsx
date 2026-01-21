'use client';

/**
 * VariablesProvider - Context for managing dynamic variables and personalization
 */

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ALL_VARIABLES, type Variable } from '@/types/variables';

interface VariableValue {
  [key: string]: string | number | boolean | Date | string[];
}

interface VariablesContextValue {
  variables: Variable[];
  values: VariableValue;
  customVariables: Variable[];
  addCustomVariable: (variable: Omit<Variable, 'id' | 'category'>) => void;
  removeCustomVariable: (id: string) => void;
  setValue: (key: string, value: VariableValue[string]) => void;
  getValue: (key: string) => VariableValue[string] | undefined;
  resolveText: (text: string) => string;
  getVariablesByCategory: (category: Variable['category']) => Variable[];
}

const VariablesContext = createContext<VariablesContextValue | null>(null);

interface VariablesProviderProps {
  children: ReactNode;
  initialValues?: VariableValue;
}

export function VariablesProvider({ children, initialValues = {} }: VariablesProviderProps) {
  const [customVariables, setCustomVariables] = useState<Variable[]>([]);
  const [values, setValues] = useState<VariableValue>(() => {
    const defaults: VariableValue = {};
    for (const v of ALL_VARIABLES) {
      defaults[v.key] = v.defaultValue;
    }
    return { ...defaults, ...initialValues };
  });

  const variables = useMemo(() => [...ALL_VARIABLES, ...customVariables], [customVariables]);

  const addCustomVariable = useCallback((variable: Omit<Variable, 'id' | 'category'>) => {
    const newVar: Variable = {
      ...variable,
      id: `custom-${Date.now()}`,
      category: 'custom',
    };
    setCustomVariables((prev) => [...prev, newVar]);
    setValues((prev) => ({ ...prev, [newVar.key]: newVar.defaultValue }));
  }, []);

  const removeCustomVariable = useCallback((id: string) => {
    setCustomVariables((prev) => {
      const variable = prev.find((v) => v.id === id);
      if (variable) {
        setValues((vals) => {
          const newVals = { ...vals };
          delete newVals[variable.key];
          return newVals;
        });
      }
      return prev.filter((v) => v.id !== id);
    });
  }, []);

  const setValue = useCallback((key: string, value: VariableValue[string]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getValue = useCallback(
    (key: string) => {
      return values[key];
    },
    [values],
  );

  const resolveText = useCallback(
    (text: string): string => {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        const value = values[trimmedKey];

        if (value === undefined) {
          return match;
        }

        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);
      });
    },
    [values],
  );

  const getVariablesByCategory = useCallback(
    (category: Variable['category']) => {
      return variables.filter((v) => v.category === category);
    },
    [variables],
  );

  const contextValue = useMemo(
    () => ({
      variables,
      values,
      customVariables,
      addCustomVariable,
      removeCustomVariable,
      setValue,
      getValue,
      resolveText,
      getVariablesByCategory,
    }),
    [
      variables,
      values,
      customVariables,
      addCustomVariable,
      removeCustomVariable,
      setValue,
      getValue,
      resolveText,
      getVariablesByCategory,
    ],
  );

  return <VariablesContext.Provider value={contextValue}>{children}</VariablesContext.Provider>;
}

export function useVariables() {
  const context = useContext(VariablesContext);
  if (!context) {
    throw new Error('useVariables must be used within VariablesProvider');
  }
  return context;
}
