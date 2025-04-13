"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Car, Search, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { supabase } from "../../lib/supabase"
import { useLanguage } from "../../contexts/LanguageContext"

interface CarBrand {
  name: string
  count: number
}

interface CarModel {
  model: string
  make: string
  count: number
}

interface ModelData {
  model: string
  make: string
  year_start: number
  year_end: number | null
}

const BrandModelSearch = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [brands, setBrands] = useState<CarBrand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("car_models").select("make").order("make")

        if (error) {
          throw error
        }

        const brandCounts: Record<string, number> = {}

        data.forEach((item: { make: string }) => {
          const make = item.make
          brandCounts[make] = (brandCounts[make] || 0) + 1
        })

        const brandArray: CarBrand[] = Object.keys(brandCounts).map((make) => ({
          name: make,
          count: brandCounts[make],
        }))

        brandArray.sort((a, b) => a.name.localeCompare(b.name))

        setBrands(brandArray)
      } catch (error) {
        console.error("Error fetching brands:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  useEffect(() => {
    if (!selectedBrand) {
      setAvailableYears([])
      return
    }

    const fetchYears = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("car_models")
          .select("year_start, year_end")
          .eq("make", selectedBrand)

        if (error) {
          throw error
        }

        const years = new Set<number>()

        data.forEach((item: { year_start: number; year_end?: number | null }) => {
          const startYear = item.year_start
          const endYear = item.year_end === null || item.year_end === 0 ? new Date().getFullYear() : item.year_end

          for (let year = startYear; year <= endYear; year++) {
            years.add(year)
          }
        })

        const yearsArray = Array.from(years).sort((a, b) => b - a)

        setAvailableYears(yearsArray)
      } catch (error) {
        console.error("Error fetching years:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchYears()
  }, [selectedBrand])

  useEffect(() => {
    if (!selectedBrand) {
      setModels([])
      return
    }

    const fetchModels = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("car_models")
          .select("model, make, year_start, year_end")
          .eq("make", selectedBrand)

        if (error) {
          throw error
        }

        console.log("Raw models from Supabase:", data)

        const year = selectedYear ? Number.parseInt(selectedYear) : null
        const isFilteringByYear = selectedYear && selectedYear !== "all"

        // Create a Set to track unique models
        const uniqueModels = new Set<string>()
        const matchingModels: ModelData[] = []

        // First pass: filter by year if needed and collect matching models
        data.forEach((item: ModelData) => {
          const startYear = item.year_start
          const endYear = item.year_end === null || item.year_end === 0 ? new Date().getFullYear() : item.year_end

          let matches = true
          if (isFilteringByYear && year !== null) {
            matches = year >= startYear && year <= endYear
          }

          console.log(`Model: ${item.model} , Start: ${startYear}, End: ${endYear}, Match: ${matches}`)

          if (matches) {
            matchingModels.push(item)
            uniqueModels.add(item.model)
          }
        })

        console.log("Filtered models:", matchingModels)

        // Convert the unique models to the expected format
        const modelArray: CarModel[] = Array.from(uniqueModels)
          .map((modelName) => ({
            model: modelName,
            make: selectedBrand,
            count: 1,
          }))
          .sort((a, b) => a.model.localeCompare(b.model))

        setModels(modelArray)
      } catch (error) {
        console.error("Error fetching models:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [selectedBrand, selectedYear])

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value)
    setSelectedYear("")
    setSelectedModel("")
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
    setSelectedModel("")
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (selectedBrand) {
      params.append("make", selectedBrand)
    }

    if (selectedModel) {
      params.append("model", selectedModel)
    }

    if (selectedYear && selectedYear !== "all") {
      params.append("year", selectedYear)
    }

    if (selectedBrand || selectedModel || (selectedYear && selectedYear !== "all")) {
      navigate(`/products?${params.toString()}`)
    }
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedBrand} onValueChange={handleBrandChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectBrand")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {brands.map((brand) => (
              <SelectItem key={brand.name} value={brand.name}>
                <div className="flex items-center">
                  <Car className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{brand.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedBrand && (
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectYear")} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem key="all-years" value="all">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{t("allYears")}</span>
                </div>
              </SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{year}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedBrand}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectModel")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {models.map((model) => (
              <SelectItem key={model.model} value={model.model}>
                {model.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={handleSearch}
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700"
          disabled={!selectedBrand && !selectedModel && !selectedYear}
        >
          <Search className="h-4 w-4 mr-2" />
          {t("findParts")}
        </Button>
      </div>
    </div>
  )
}

export default BrandModelSearch
