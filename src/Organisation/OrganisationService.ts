import type {OrganisationRepository} from "./OrganisationRepository.js";
import type {CreateOrganisationParams} from "./OrganisationTypes.js";

export default class OrganisationService {
  private readonly orgRepository: OrganisationRepository;
  constructor(orgRepository: OrganisationRepository) {
    this.orgRepository = orgRepository;
  }

  async fetchOrganisations() {
    return this.orgRepository.findAll();
  }

  //TODO maybe max name unique ?
  async createOrganisation(params: CreateOrganisationParams) {
    return this.orgRepository.insertOne({name: params.name});
  }
}
