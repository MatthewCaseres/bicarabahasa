"use client"
import { useState } from "react"
import { Dialog } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { NameDescriptionForm } from "../_components/NameDescriptionForm"

export default function CompletionPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit lol</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <NameDescriptionForm
          onSubmit={(values) => {
            console.log(values)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
          entityTitle="lol"
        />
      </Dialog>
    </>
  )
}
