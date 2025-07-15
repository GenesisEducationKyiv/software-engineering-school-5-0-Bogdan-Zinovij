module.exports = {
  required: [
    {
      name: 'controllers depend on application services',
      comment: 'Controllers must depend on application services only',
      module: {
        path: 'interfaces/controllers/.*\\.controller\\.ts$',
      },
      to: {
        path: 'application/.*\\.service\\.ts$',
      },
    },
    {
      name: 'application depends on domain',
      comment: 'Application layer should only depend on the domain layer',
      module: {
        path: 'application/.*\\.service\\.ts$',
      },
      to: {
        path: 'domain/.*\\.ts$',
      },
    },
  ],
  forbidden: [
    {
      name: 'no circular dependencies',
      severity: 'error',
      comment:
        'Circular dependencies between modules are forbidden (except for ORM entities)',
      from: {
        pathNot: 'infrastructure/persistence/entities/.*\\.entity\\.ts$',
      },
      to: {
        circular: true,
      },
    },
    {
      name: 'controllers should not access infrastructure',
      severity: 'error',
      comment: 'Controllers must not directly depend on infrastructure layer',
      from: {
        path: 'interfaces/controllers/.*\\.controller\\.ts$',
      },
      to: {
        path: 'infrastructure/.*\\.ts$',
      },
    },
    {
      name: 'application should not depend on infrastructure',
      severity: 'error',
      comment: 'Application layer must not depend on infrastructure layer',
      from: {
        path: 'application/.*\\.ts$',
      },
      to: {
        path: 'infrastructure/.*\\.ts$',
      },
    },
    {
      name: 'domain should be pure',
      severity: 'error',
      comment: 'Domain layer must not depend on any other layer',
      from: {
        path: 'domain/.*\\.ts$',
      },
      to: {
        path: '(application|infrastructure|interfaces)/.*\\.ts$',
      },
    },
    {
      name: 'shared code should not depend on feature modules',
      severity: 'error',
      comment:
        'Common code (interfaces, constants, enums) must not depend on features like subscription, mail, etc.',
      from: {
        path: 'common/(interfaces|constants|enums)/.*\\.ts$',
      },
      to: {
        path: '(subscription|mail|monitoring)/.*\\.ts$',
      },
    },
  ],
  options: {
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      extensions: ['.ts', '.js'],
    },
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
  },
};
