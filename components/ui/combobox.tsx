import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ComboboxOption {
  label: string
  value: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  onSelect: (option: ComboboxOption) => void
  placeholder?: string
  allowCustom?: boolean
  value?: string
  className?: string
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  onSelect,
  placeholder = "Buscar...",
  allowCustom = true,
  value = "",
  className = "",
}) => {
  const [inputValue, setInputValue] = React.useState(value)
  const [showOptions, setShowOptions] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Mostrar todas las opciones cuando no hay texto o filtrar cuando hay texto
  const filteredOptions = inputValue.trim() === "" 
    ? options.slice(0, 10) // Mostrar solo las primeras 10 opciones cuando no hay texto
    : options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 15) // Limitar a 15 resultados cuando hay filtro

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (option: ComboboxOption) => {
    setInputValue(option.label)
    setShowOptions(false)
    onSelect(option)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowOptions(true)
    setHighlightedIndex(0)
  }

  const handleFocus = () => {
    setShowOptions(true)
    setHighlightedIndex(0)
  }

  const handleBlur = () => {
    setTimeout(() => setShowOptions(false), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOptions) return
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex])
      } else if (allowCustom && inputValue.trim() !== "") {
        handleSelect({ label: inputValue, value: inputValue })
      }
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showOptions && (
        <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-56 overflow-auto">
          {filteredOptions.length === 0 && allowCustom && inputValue.trim() !== "" ? (
            <div
              className="px-4 py-2 text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => handleSelect({ label: inputValue, value: inputValue })}
            >
              Agregar "{inputValue}"
            </div>
          ) : filteredOptions.length === 0 && inputValue.trim() === "" ? (
            <div className="px-4 py-2 text-muted-foreground">
              Escribe para buscar o agregar nuevo
            </div>
          ) : (
            filteredOptions.map((option, idx) => (
              <div
                key={option.value}
                className={cn(
                  "px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  idx === highlightedIndex && "bg-accent text-accent-foreground"
                )}
                onMouseDown={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
} 