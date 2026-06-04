import { decrypt } from './src/common/utils/encryption.util';

const encryptedData = 'YHC20Lkjfewf7ug8X1KCb+uQKHpOeHbkQEoM9n9NHZ+n1dOJqTeZ5VdVfnsK7VwVwxQoCf9oVcaRw6M2aJEuBGzztopPrJQ79Cw9X4RQivy4AqJd74pSh3HqG27vS6inF6sUfc60CXjmGqfckno/v4yHRDM10k2G+5kpmUTQF7MUrA==';
try {
    const decrypted = decrypt(encryptedData);
    console.log('Decrypted data:', decrypted);
} catch (e) {
    console.error('Decryption failed:', e);
}
