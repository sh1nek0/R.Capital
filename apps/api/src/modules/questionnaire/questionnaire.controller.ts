import { Body, Controller, Post } from "@nestjs/common";
import { SubmitQuestionnaireDto } from "./dto/submit-questionnaire.dto";
import { QuestionnaireService } from "./questionnaire.service";

@Controller("questionnaire")
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post("submit")
  submit(@Body() dto: SubmitQuestionnaireDto) {
    return this.questionnaireService.submit(dto);
  }
}

