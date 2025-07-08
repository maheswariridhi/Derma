# AI Educational Content Feature Setup

This document explains how to set up and use the new AI-powered educational content feature for treatments and medicines.

## Overview

The feature automatically generates patient-friendly explanations for treatments and medicines using Anthropic's Claude 3 Sonnet model. These explanations are stored in a new `treatment_info` table and can be displayed to both doctors and patients.

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SECRET_KEY=your_supabase_secret_key_here

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# CORS Configuration
ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 2. Database Setup

Run the updated `supabase_setup.sql` script to create the new `treatment_info` table:

```sql
-- The script has been updated to include:
-- - treatment_info table
-- - Indexes for better performance
-- - RLS policies for security
-- - Triggers for automatic timestamp updates
```

### 3. New Files Created

- `backend/app/services/ai_service.py` - AI service for generating educational content
- `frontend/src/services/TreatmentInfoService.ts` - Frontend service for API calls

### 4. Updated Files

- `backend/supabase_setup.sql` - Added treatment_info table
- `backend/app/services/supabase_service.py` - Added treatment_info methods
- `backend/app/main.py` - Added new API endpoints
- `frontend/src/components/workflow/ReviewAndFinalize.tsx` - Added educational content display
- `frontend/src/components/patient/ReportViewer.tsx` - Added educational content for patients

## API Endpoints

### GET `/api/treatment-info/{item_type}/{item_id}`
- Gets educational content for a treatment or medicine
- If content doesn't exist, generates it automatically
- Parameters:
  - `item_type`: "treatment" or "medicine"
  - `item_id`: ID of the treatment or medicine

### POST `/api/treatment-info/generate`
- Manually generates educational content
- Request body:
  ```json
  {
    "item_type": "treatment" | "medicine",
    "item_id": "string"
  }
  ```

## Frontend Features

### Doctor Interface (ReviewAndFinalize)
- Expandable sections for each treatment and medicine
- Educational content is fetched on-demand when expanded
- Loading states and error handling
- Content is displayed in a blue-themed box

### Patient Interface (ReportViewer)
- Educational content for medications and treatments
- Expandable sections with clear labeling
- Patient-friendly explanations
- Loading states and fallback messages

## Usage

### For Doctors
1. In the ReviewAndFinalize step, select treatments and medicines
2. Click the expand button (▼) next to any item to view educational content
3. The content is automatically generated and cached for future use

### For Patients
1. View their treatment report
2. Click the expand button next to medications or treatments
3. Read patient-friendly explanations about their care

## Technical Details

### AI Prompts
The system uses carefully crafted prompts with Claude 3 Sonnet to generate:
- Treatment explanations covering what it does, what to expect, duration, side effects
- Medicine explanations covering usage, dosage, side effects, when to contact doctor

### Caching
- Educational content is stored in the database after generation
- Subsequent requests return cached content
- Content can be regenerated using the POST endpoint

### Error Handling
- Graceful fallbacks when AI service is unavailable
- Loading states for better UX
- Error messages for failed requests

## Security Considerations

- Anthropic API key should be kept secure
- RLS policies protect treatment_info data
- Content is generated server-side only
- No sensitive medical data is sent to Anthropic

## Cost Considerations

- Anthropic API calls cost money per token
- Content is cached to minimize repeated calls
- Consider implementing rate limiting for production

## Future Enhancements

- Support for multiple languages
- Customizable prompt templates
- Content versioning and updates
- Integration with medical knowledge bases
- Patient feedback on content quality 