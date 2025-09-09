/**
 * 🍃 SCRIPT - Test MongoDB Migration Harmonisation
 *
 * Script simple pour tester les migrations MongoDB de façon isolée
 * Vérifie que l'harmonisation password → hashedPassword fonctionne
 *
 * USAGE:
 * npm run test:migration:mongo
 */

import { MongoClient, Db, Collection } from 'mongodb';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * 🧪 Test simple de la migration MongoDB
 */
async function testMongoMigration(): Promise<void> {
  const mongoUri = 'mongodb://admin:password123@localhost:27017/cleanarchi_test';
  const client = new MongoClient(mongoUri);
  const results: TestResult[] = [];

  try {
    console.log('🔌 Connexion à MongoDB de test...');
    await client.connect();
    const db: Db = client.db('cleanarchi_test');
    const usersCollection: Collection = db.collection('users');

    // 1. Nettoyer la collection de test
    await usersCollection.deleteMany({});
    results.push({
      step: 'Cleanup',
      success: true,
      message: 'Collection nettoyée avec succès',
    });

    // 2. Insérer des données avec ancien format (password)
    const testUsers = [
      {
        _id: 'test-user-1',
        email: 'test1@example.com',
        name: 'Test User 1',
        password: 'hashed_password_123', // Ancien format
        role: 'USER',
        createdAt: new Date(),
      },
      {
        _id: 'test-user-2',
        email: 'test2@example.com',
        name: 'Test User 2',
        password: 'hashed_password_456', // Ancien format
        role: 'MANAGER',
        createdAt: new Date(),
      },
    ];

    await usersCollection.insertMany(testUsers);
    results.push({
      step: 'Insert Test Data',
      success: true,
      message: 'Données de test insérées avec ancien format "password"',
      data: { count: testUsers.length },
    });

    // 3. Vérifier que les documents ont le champ "password"
    const docsWithPassword = await usersCollection.countDocuments({
      password: { $exists: true },
    });
    results.push({
      step: 'Verify Old Format',
      success: docsWithPassword === 2,
      message: `${docsWithPassword} documents avec champ "password" trouvés`,
      data: { count: docsWithPassword },
    });

    // 4. Exécuter la migration : password → hashedPassword
    console.log('🔄 Exécution de la migration password → hashedPassword...');
    const renameResult = await usersCollection.updateMany(
      { password: { $exists: true } },
      { $rename: { password: 'hashedPassword' } },
    );

    results.push({
      step: 'Execute Migration',
      success: renameResult.modifiedCount === 2,
      message: `Migration exécutée: ${renameResult.modifiedCount} documents modifiés`,
      data: {
        matchedCount: renameResult.matchedCount,
        modifiedCount: renameResult.modifiedCount,
      },
    });

    // 5. Vérifier que les documents n'ont plus le champ "password"
    const remainingPasswordDocs = await usersCollection.countDocuments({
      password: { $exists: true },
    });
    results.push({
      step: 'Verify No Password Field',
      success: remainingPasswordDocs === 0,
      message: `${remainingPasswordDocs} documents avec "password" restants (doit être 0)`,
      data: { count: remainingPasswordDocs },
    });

    // 6. Vérifier que les documents ont maintenant le champ "hashedPassword"
    const docsWithHashedPassword = await usersCollection.countDocuments({
      hashedPassword: { $exists: true },
    });
    results.push({
      step: 'Verify New Format',
      success: docsWithHashedPassword === 2,
      message: `${docsWithHashedPassword} documents avec "hashedPassword" trouvés`,
      data: { count: docsWithHashedPassword },
    });

    // 7. Vérifier que les valeurs sont correctes
    const users = await usersCollection.find({}).toArray();
    const user1 = users.find((u) => u._id === 'test-user-1');
    const user2 = users.find((u) => u._id === 'test-user-2');

    const valuesCorrect =
      user1?.hashedPassword === 'hashed_password_123' &&
      user2?.hashedPassword === 'hashed_password_456';

    results.push({
      step: 'Verify Values',
      success: valuesCorrect,
      message: valuesCorrect
        ? 'Toutes les valeurs hashedPassword sont correctes'
        : 'Erreur: valeurs hashedPassword incorrectes',
      data: {
        user1Hash: user1?.hashedPassword,
        user2Hash: user2?.hashedPassword,
      },
    });

    // 8. Test de rollback : hashedPassword → password
    console.log('🔄 Test de rollback hashedPassword → password...');
    const rollbackResult = await usersCollection.updateMany(
      { hashedPassword: { $exists: true } },
      { $rename: { hashedPassword: 'password' } },
    );

    results.push({
      step: 'Test Rollback',
      success: rollbackResult.modifiedCount === 2,
      message: `Rollback exécuté: ${rollbackResult.modifiedCount} documents modifiés`,
      data: {
        matchedCount: rollbackResult.matchedCount,
        modifiedCount: rollbackResult.modifiedCount,
      },
    });

    // 9. Vérifier le rollback
    const afterRollbackPassword = await usersCollection.countDocuments({
      password: { $exists: true },
    });
    const afterRollbackHashed = await usersCollection.countDocuments({
      hashedPassword: { $exists: true },
    });

    results.push({
      step: 'Verify Rollback',
      success: afterRollbackPassword === 2 && afterRollbackHashed === 0,
      message: `Rollback vérifié: ${afterRollbackPassword} "password", ${afterRollbackHashed} "hashedPassword"`,
      data: {
        passwordCount: afterRollbackPassword,
        hashedPasswordCount: afterRollbackHashed,
      },
    });
  } catch (error) {
    results.push({
      step: 'Error',
      success: false,
      message: `Erreur pendant le test: ${error}`,
      data: error,
    });
  } finally {
    await client.close();
  }

  // Affichage des résultats
  console.log('\n📊 RÉSULTATS DU TEST DE MIGRATION:');
  console.log('='.repeat(50));

  let successCount = 0;
  let totalSteps = results.length;

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const stepNumber = (index + 1).toString().padStart(2, '0');

    console.log(`${status} ${stepNumber}. ${result.step}: ${result.message}`);

    if (result.data) {
      console.log(`    📊 Data: ${JSON.stringify(result.data)}`);
    }

    if (result.success) {
      successCount++;
    }
  });

  console.log('='.repeat(50));
  console.log(
    `🎯 RÉSUMÉ: ${successCount}/${totalSteps} étapes réussies (${Math.round((successCount / totalSteps) * 100)}%)`,
  );

  if (successCount === totalSteps) {
    console.log('🎉 SUCCÈS: Migration MongoDB password → hashedPassword fonctionnelle !');
    process.exit(0);
  } else {
    console.log('❌ ÉCHEC: Des étapes de migration ont échoué');
    process.exit(1);
  }
}

// Exécution du test
if (require.main === module) {
  testMongoMigration().catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}
