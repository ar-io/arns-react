export class ContractInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Contract Interaction Error';
  }
}
