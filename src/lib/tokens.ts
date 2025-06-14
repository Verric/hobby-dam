//TODO this was gen by Zed's agentic AI stuff check later
export const TOKENS = {
  // Core Infrastructure
  Logger: Symbol.for("Logger"),
  AppConfig: Symbol.for("AppConfig"),

  // MongoDB Collections
  AssetCollection: Symbol.for("AssetCollection"),
  AccessCollection: Symbol.for("AccessCollection"),
  GroupCollection: Symbol.for("GroupCollection"),
  OrganisationCollection: Symbol.for("OrganisationCollection"),
  UserCollection: Symbol.for("UserCollection"),
  WorkflowTemplateCollection: Symbol.for("WorkflowTemplateCollection"),
  ApprovalInstanceCollection: Symbol.for("ApprovalInstanceCollection"),
  DashboardCollection: Symbol.for("DashboardCollection"),
  AssetReportCollection: Symbol.for("AssetReportCollection"),

  // Repositories
  AssetRepository: Symbol.for("AssetRepository"),
  AccessRepository: Symbol.for("AccessRepository"),
  GroupRepository: Symbol.for("GroupRepository"),
  OrganisationRepository: Symbol.for("OrganisationRepository"),
  UserRepository: Symbol.for("UserRepository"),
  WorkflowTemplateRepository: Symbol.for("WorkflowTemplateRepository"),
  ApprovalInstanceRepository: Symbol.for("ApprovalInstanceRepository"),

  // Services
  AssetsService: Symbol.for("AssetsService"),
  AccessService: Symbol.for("AccessService"),
  GroupService: Symbol.for("GroupService"),
  OrganisationService: Symbol.for("OrganisationService"),
  UserService: Symbol.for("UserService"),
  AuthService: Symbol.for("AuthService"),
  WorkflowTemplateService: Symbol.for("WorkflowTemplateService"),
  ApprovalInstanceService: Symbol.for("ApprovalInstanceService"),
  ReportService: Symbol.for("ReportService"),

  // Controllers
  AssetController: Symbol.for("AssetController"),
  AccessController: Symbol.for("AccessController"),
  GroupController: Symbol.for("GroupController"),
  OrganisationController: Symbol.for("OrganisationController"),
  UserController: Symbol.for("UserController"),
  WorkflowTemplateController: Symbol.for("WorkflowTemplateController"),
  ApprovalInstanceController: Symbol.for("ApprovalInstanceController"),
  ReportController: Symbol.for("ReportController"),

  // External Services
  FileStorage: Symbol.for("FileStorage"),
  IndexingService: Symbol.for("IndexingService"),
  EventEmitter: Symbol.for("EventEmitter"),

  // Access Control
  AccessChecker: Symbol.for("AccessChecker"),
  GroupStrategy: Symbol.for("GroupStrategy"),
} as const;
