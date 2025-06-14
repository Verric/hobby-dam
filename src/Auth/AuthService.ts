import type {UserRepository} from "../User/index.js";

export class AuthService {
  private readonly userRepo: UserRepository;
  //private readonly accessService: AccessService;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
    //this.accessService = accessService;
  }

  async authLogin(username: string, orgId: string) {
    const user = await this.userRepo.fetchUserByName(username, orgId);
    // const accessIds = await this.accessService.fetchAccessByUserUserId(
    //   user._id.toHexString()
    // );
    // console.log("accessIds", accessIds);
    //return {...user, accessIds};
    return user;
  }
}
