
import fs from 'fs';
import Papa from 'papaparse';
import { processBatchWithAI } from '../services/aibatchstream.js';

export function parsethecsv(filePath) {
    return new Promise((resolve, reject) => {
        const inputStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

        let totalImported = 0;
        let totalSkipped = 0;
        const allFinalRecords = [];

       
        let currentBatch = [];
        const BATCH_SIZE = 50;

        Papa.parse(inputStream, {
            header: true,
            skipEmptyLines: 'greedy',
            step: function (results, parser) {
                const rawRow = results.data;
                const valuesString = Object.values(rawRow).join('').trim();
                if (!valuesString) {
                    totalSkipped++;
                    return;
                }

                currentBatch.push(rawRow);

                if (currentBatch.length >= BATCH_SIZE) {
                   
                    parser.pause();

                    processBatchWithAI(currentBatch)
                        .then((aiMappedRecords) => {
                          
                            const validatedRecords = aiMappedRecords.filter(record => {
                                const hasEmail = record.email && record.email.trim() !== "";
                                const hasMobile = record.mobile_without_country_code && String(record.mobile_without_country_code).trim() !== "";
                                return hasEmail || hasMobile;
                            });

                            
                            const skippedInThisBatch = currentBatch.length - validatedRecords.length;

                            totalImported += validatedRecords.length;
                            totalSkipped += skippedInThisBatch;
                            allFinalRecords.push(...validatedRecords);

                          
                            currentBatch = [];
                            parser.resume();
                        })
                        .catch((err) => {
                            parser.abort();
                            cleanupTempFile(filePath);
                            reject(err);
                        });
                }
            },

            complete: async function () {
                try {
                    
                    if (currentBatch.length > 0) {
                        const aiMappedRecords = await processBatchWithAI(currentBatch);
                        
                        const validatedRecords = aiMappedRecords.filter(record => {
                            const hasEmail = record.email && record.email.trim() !== "";
                            const hasMobile = record.mobile_without_country_code && String(record.mobile_without_country_code).trim() !== "";
                            return hasEmail || hasMobile;
                        });

                        const skippedInThisBatch = currentBatch.length - validatedRecords.length;
                        totalImported += validatedRecords.length;
                        totalSkipped += skippedInThisBatch;
                        allFinalRecords.push(...validatedRecords);
                    }

                  
                    cleanupTempFile(filePath);

                   
                    resolve({
                        totalImported,
                        totalSkipped,
                        records: allFinalRecords
                    });

                } catch (error) {
                    cleanupTempFile(filePath);
                    reject(error);
                }
            },

           
            error: function (error) {
                cleanupTempFile(filePath);
                reject(error);
            }
        });
    });
}


function cleanupTempFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error(`[Storage Warning] Failed to delete temp file: ${filePath}`, err);
            else 
                console.log(`[Storage Clean] Temp file successfully erased: ${filePath}`);
        });
    }
}