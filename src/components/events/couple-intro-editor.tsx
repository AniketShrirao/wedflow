'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CoupleIntroEditorProps {
  coupleIntro: string
  onUpdate: (intro: string) => void
}

export function CoupleIntroEditor({ coupleIntro, onUpdate }: CoupleIntroEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    onUpdate(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Couple Introduction</CardTitle>
        <CardDescription>
          Write a beautiful introduction about yourselves that will appear on your public wedding site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="couple-intro">Your Story</Label>
          <Textarea
            id="couple-intro"
            value={coupleIntro}
            onChange={handleChange}
            placeholder="Tell your love story... How did you meet? What makes your relationship special? Share something that your guests would love to know about your journey together."
            className="min-h-[200px] mt-2"
          />
          <p className="text-sm text-gray-500 mt-2">
            This will be displayed prominently on your wedding site's hero section
          </p>
        </div>

        {/* Preview */}
        {coupleIntro && (
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-700">Preview:</Label>
            <div className="mt-2 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed italic">
                "{coupleIntro}"
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}