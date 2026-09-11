import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  registerOffer,
} from "@/services/offers/offer.service";

export async function POST(
  request:
    NextRequest
) {

  try {

    const formData =
      await request.formData();

    const file =
      formData.get(
        "file"
      );

    if (
      !(file instanceof File)
    ) {
      throw new Error(
        "Offer letter PDF is required"
      );
    }

    const input = {
      applicationId:
        String(
          formData.get(
            "applicationId"
          ) ?? ""
        ),

      feedbackId:
        String(
          formData.get(
            "feedbackId"
          ) ?? ""
        ),

      designation:
        String(
          formData.get(
            "designation"
          ) ?? ""
        ),

      department:
        String(
          formData.get(
            "department"
          ) ?? ""
        ) || undefined,

      employmentType:
        String(
          formData.get(
            "employmentType"
          ) ?? ""
        ) || undefined,

      joiningLocation:
        String(
          formData.get(
            "joiningLocation"
          ) ?? ""
        ) || undefined,

      annualCtc:
        formData.get(
          "annualCtc"
        )
          ? Number(
              formData.get(
                "annualCtc"
              )
            )
          : undefined,

      currency:
        String(
          formData.get(
            "currency"
          ) ?? "INR"
        ),

      joiningDate:
        String(
          formData.get(
            "joiningDate"
          ) ?? ""
        ) || undefined,

      offerDate:
        String(
          formData.get(
            "offerDate"
          ) ?? ""
        ) || undefined,

      offerValidUntil:
        String(
          formData.get(
            "offerValidUntil"
          ) ?? ""
        ) || undefined,

      probationPeriodMonths:
        formData.get(
          "probationPeriodMonths"
        )
          ? Number(
              formData.get(
                "probationPeriodMonths"
              )
            )
          : undefined,

      noticeBuyoutAvailable:
        formData.get(
          "noticeBuyoutAvailable"
        ) === "true",

      notes:
        String(
          formData.get(
            "notes"
          ) ?? ""
        ) || undefined,
    };

    const result =
      await registerOffer({
        input,
        file,
      });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to upload offer",
      },
      {
        status: 400,
      }
    );
  }
}