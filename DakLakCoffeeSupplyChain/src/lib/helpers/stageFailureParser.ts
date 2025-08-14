export interface StageFailureInfo {
  failedStageId?: string;
  failedStageName: string;
  details: string;
  recommendations: string;
  isFailure: boolean;
}

export class StageFailureParser {
  private static readonly FAILED_STAGE_ID_PREFIX = "FAILED_STAGE_ID:";
  private static readonly FAILED_STAGE_NAME_PREFIX = "FAILED_STAGE_NAME:";
  private static readonly DETAILS_PREFIX = "DETAILS:";
  private static readonly RECOMMENDATIONS_PREFIX = "RECOMMENDATIONS:";

  /**
   * Parse thông tin stage failure từ comments
   */
  static parseFailureFromComments(comments?: string): StageFailureInfo | null {
    if (!comments || !comments.includes(this.FAILED_STAGE_ID_PREFIX)) {
      return null;
    }

    try {
      const parts = comments.split('|');
      
      const stageIdPart = parts.find(p => p.startsWith(this.FAILED_STAGE_ID_PREFIX));
      const stageNamePart = parts.find(p => p.startsWith(this.FAILED_STAGE_NAME_PREFIX));
      const detailsPart = parts.find(p => p.startsWith(this.DETAILS_PREFIX));
      const recommendationsPart = parts.find(p => p.startsWith(this.RECOMMENDATIONS_PREFIX));

      if (!stageIdPart) return null;

      const stageIdStr = stageIdPart.replace(this.FAILED_STAGE_ID_PREFIX, "");
      const stageId = parseInt(stageIdStr);
      if (isNaN(stageId)) return null;

      return {
        failedStageId: stageId.toString(),
        failedStageName: stageNamePart?.replace(this.FAILED_STAGE_NAME_PREFIX, "") || "",
        details: detailsPart?.replace(this.DETAILS_PREFIX, "") || "",
        recommendations: recommendationsPart?.replace(this.RECOMMENDATIONS_PREFIX, "") || "",
        isFailure: true
      };
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra xem comments có chứa thông tin failure không
   */
  static isFailureComment(comments?: string): boolean {
    return !!(comments && comments.includes(this.FAILED_STAGE_ID_PREFIX));
  }
}
