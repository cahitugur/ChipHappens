import { Repository } from './repository';
import { localRepository } from './local-repository';
import { cloudRepository } from './cloud-repository';

export function getRepository(loggedIn: boolean): Repository {
  // For now, just switch based on login state. Later, add sync logic.
  return loggedIn ? cloudRepository : localRepository;
}
