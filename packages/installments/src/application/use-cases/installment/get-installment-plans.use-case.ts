/**
 * Use Case: GetInstallmentPlans
 * Gets installment plans from repository
 */
import { GetInstallmentPlansRequest, GetInstallmentPlansResponse } from '../../dto';
import { IInstallmentDataRepository } from '../../ports/index.js';

export class GetInstallmentPlansUseCase {
  constructor(private repository: IInstallmentDataRepository) {}

  async execute(request: GetInstallmentPlansRequest): Promise<GetInstallmentPlansResponse> {
    // Validate application input
    this.validateRequest(request);

    // Get installment plans from repository
    return await this.repository.getInstallmentPlans(
      request.amount,
      request.currency,
      request.country,
      request.customerType,
      request.publicKey
    );
  }

  private validateRequest(request: GetInstallmentPlansRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (!request.currency || !request.country || !request.customerType) {
      throw new Error('Currency, country, and customer type are required');
    }
  }
}
