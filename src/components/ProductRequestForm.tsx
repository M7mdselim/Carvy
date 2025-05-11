"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Phone, Car, Search, X } from "lucide-react"

interface FormValues {
  carMake: string
  carModel: string
  productName: string
  phoneNumber: string
}

const ProductRequestForm = () => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [carMakes, setCarMakes] = useState<string[]>([])
  const [carModels, setCarModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      carMake: "",
      carModel: "",
      productName: "",
      phoneNumber: "",
    },
  })

  // Fetch car makes from the database
  useEffect(() => {
    const fetchCarMakes = async () => {
      try {
        const { data, error } = await supabase.from("car_models").select("make").order("make").limit(100)

        if (error) throw error

        if (data) {
          // Extract unique makes
          const uniqueMakes = Array.from(new Set(data.map((item) => item.make)))
          setCarMakes(uniqueMakes)
        }
      } catch (error) {
        console.error("Error fetching car makes:", error)
      }
    }

    fetchCarMakes()
  }, [])

  // Fetch car models based on selected make
  const fetchCarModels = async (make: string) => {
    if (!make) {
      setCarModels([])
      return
    }

    try {
      const { data, error } = await supabase
        .from("car_models")
        .select("model")
        .eq("make", make)
        .order("model")
        .limit(100)

      if (error) throw error

      if (data) {
        const uniqueModels = Array.from(new Set(data.map((item) => item.model)))
        setCarModels(uniqueModels)
      }
    } catch (error) {
      console.error("Error fetching car models:", error)
    }
  }

  const handleMakeChange = (value: string) => {
    form.setValue("carMake", value)
    form.setValue("carModel", "") // Reset model when make changes
    fetchCarModels(value)
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("product_requests").insert({
        user_id: user?.id || null,
        car_make: values.carMake || null,
        car_model: values.carModel || null,
        product_name: values.productName,
        phone_number: values.phoneNumber,
      })

      if (error) throw error

      toast.success(t("productRequestSuccess"))
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error("Error submitting product request:", error)
      toast.error(t("productRequestError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 left-10 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="rounded-full shadow-md py-2 px-2 sm:py-2.5 sm:px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-transform hover:scale-105"
          >
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="ml-2 text-xs font-medium hidden sm:inline">{t("requestProductTitle")}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85%] sm:w-[400px] p-5 bg-white shadow-lg border border-gray-200">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-lg text-indigo-700">{t("requestProductTitle")}</SheetTitle>
            <SheetDescription className="text-sm text-gray-600">{t("requestProductDescription")}</SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="carMake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t("carMake")}</FormLabel>
                    <Select onValueChange={(value) => handleMakeChange(value)} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder={t("selectCarMake")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carMakes.map((make) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t("carModel")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("carMake")}>
                      <FormControl>
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder={t("selectCarModel")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productName"
                rules={{ required: t("productNameRequired") }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t("productName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterProductName")} className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                rules={{
                  required: t("phoneNumberRequired"),
                  pattern: {
                    value: /^[0-9+\-\s()]{8,20}$/,
                    message: t("invalidPhoneNumber"),
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t("phoneNumber")} *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input className="pl-10 text-sm" placeholder={t("enterPhoneNumber")} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="text-xs py-1 px-2">
                  <X className="mr-1 h-3 w-3" />
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs py-1 px-2"
                >
                  <Car className="mr-1 h-3 w-3" />
                  {loading ? t("submitting") : t("submitRequest")}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default ProductRequestForm
