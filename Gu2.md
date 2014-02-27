GU- Blood Brain Analysis Part II
========================================================





Array analysis for Ben Andreone (bandreon4119@gmail.com) at Neurobiology at HMS. Contact Meeta Mistry (mmistry@hsph.harvard.edu) for additional details. Request from client was:
  
> Compare the gene expression levels to those from other endothelial cell microarray data sets published in GEO. Two specific datasets of interest: 1) GSE9202 This study compared expression in E18.5 and adult mouse brain endothelial cells to samples from the rest of the brain 2) GSE35802 This study compared expression in endothelial cells between brain and lung at E14.5, P7.5, and adult. They used a different platform (Agilent 4x44K), but it may be interesting to qualitatively compare their data to our timepoint.

# Bioconductor and R libraries used

```r

library(affy)
library(arrayQualityMetrics)
library(RColorBrewer)
library(simpleaffy)
library(limma)
library(pheatmap)
library(ape)
library(statmod)
library(xtable)
library(plyr)
library(ggplot2)
library(gplots)
library(GEOquery)

# Grab John Hutchinson's convenience functions
source("http://dl.dropboxusercontent.com/u/4253254/Resources/functions.r")
source("~/R/scripts/useful functions/roc.R")
```


### Get variables
- get base directory for analyses
- specify data and results directories
- specify column headers used in metadata file



```r
# Setup directory variables
baseDir <- "."
dataDir <- file.path(baseDir, "data")
metaDir <- file.path(dataDir, "meta")
resultsDir <- file.path(baseDir, "results")
# covarsfilename <- 'covdesc.txt'
```


### Load the expression data


```r

# Load GEO data

# Affymetrix GeneChip Mouse Genome 430 2.0 microarrays. Array data was
# processed using the Affy and gcrma packages
gse1 <- getGEO("GSE9202", destdir = file.path(dataDir, "geo"))

# Agilent 4x44K
gse2 <- getGEO("GSE35802", destdir = file.path(dataDir, "geo"))

eset1 <- as(gse1$GSE9202_series_matrix.txt.gz, "ExpressionSet")
eset2 <- as(gse2$GSE35802_series_matrix.txt.gz, "ExpressionSet")
```





## GSE9202

> Array data was processed using the Affy and gcrma packages in the Bioconductor project. Student t test was used to evaluate differential expression. The false discovery rate method was used to perform multiple test correction for probability values.The log2 change was calculated as the log2 of the average expression difference between E18.5 microvessels and “rest-of-brain” tissue or adult brain microvessels.


### Load the metadata: GSE9202


```r

meta1 <- read.table(file.path(metaDir, "GSE9202.pheno.txt"), header = TRUE, 
    sep = "\t", na.strings = "NULL", row.names = 1)
pData(eset1) <- meta1

# Table of attributes
kable(table(meta1$Timept, meta1$Specimen), format = "html")
```

<table>
 <thead>
  <tr>
   <th>   </th>
   <th> MicrovascularFragments </th>
   <th> RestOftheBrain </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td> 1yearold </td>
   <td> 3 </td>
   <td> 0 </td>
  </tr>
  <tr>
   <td> E18.5 </td>
   <td> 3 </td>
   <td> 3 </td>
  </tr>
</tbody>
</table>

```r
mosaicplot(table(meta1$Timept, meta1$Specimen), main = "Categorial variables")
```

<img src="figure/import_metadata1.png" title="plot of chunk import metadata1" alt="plot of chunk import metadata1" width="800px" />



### QC Analysis
ArrayQualityMetrics QC report for [GSE9202](./results/report_raw_GSE9202/index.html)



```r
arrayQualityMetrics(expressionset = eset1, intgroup = c("Specimen", "Timept"), 
    outdir = "./results/report_raw_GSE9202", force = TRUE, do.logtransform = FALSE)
```

 

### Differential expression analysis
Following a similar [example](http://www.bioconductor.org/help/course-materials/2005/BioC2005/labs/lab01/estrogen/)


```r

# Get contrasts
f <- paste(meta1$Specimen, meta1$Timept, sep = "")
f <- factor(f)
design <- model.matrix(~0 + f)
colnames(design) <- levels(f)


# Fit a linear model
fit <- lmFit(eset1, design)

# Define a comtrast model matrix
cont.matrix <- makeContrasts(byage = "MicrovascularFragmentsE18.5-MicrovascularFragments1yearold", 
    bytissue = "MicrovascularFragmentsE18.5-RestOftheBrainE18.5", levels = design)

# Extract the linear model fit for the contrasts
fit2 <- contrasts.fit(fit, cont.matrix)
fit2 <- eBayes(fit2)

# Set threshold
p.cutoff <- 0.001
logfc.cutoff <- 2

# Get significant genes
gene_list <- topTable(fit2, coef = 2, number = nrow(exprs(eset1)))
gene_list$threshold.FDR = as.factor(abs(gene_list$logFC) > logfc.cutoff & gene_list$adj.P.Val < 
    p.cutoff)
top.genes <- gene_list[which(as.logical(gene_list$threshold.FDR)), ]

results <- decideTests(fit2, adjust.method = "fdr", p.value = p.cutoff, lfc = logfc.cutoff)
colnames(results) <- c("Age Effects", "Tissue Effects")

GSE9202 <- gene_list
vennDiagram(results)
```

<img src="figure/GSE9202_analysis.png" title="plot of chunk GSE9202 analysis" alt="plot of chunk GSE9202 analysis" width="800px" />


### Cross-reference tissue effects against results from the Gu dataset re-analysis
The Venn diagram illustrates the number of overlapping signigicant probes between the two datasets. The ROC curve is used to illustrate where the Gu dataset significant probes appear with respect to the ranking of GSE9202 genes (ranked by adjusted p-value).

<img src="figure/cross-reference21.png" title="plot of chunk cross-reference2" alt="plot of chunk cross-reference2" width="800px" /><img src="figure/cross-reference22.png" title="plot of chunk cross-reference2" alt="plot of chunk cross-reference2" width="800px" />



## GSE35802

> GSE35802: A linear model was fit to the filtered data using the limma package from Bioconductor and comparisons
were analyzed between brain and liver/lung tissue at each developmental stage (embryo, pup, or adult). Criteria for DE was log 2 FC > 1 and adjusted p-value < 0.05 (Benjamini-Hochberg correction). As expected, microarray analysis identified several Wnt/beta-catenin target genes and other previously characterized BBB-marker genes i.e Glut1, P-gp, Meca32, Lef1


### Load the metadata: GSE35802

```r

meta2 <- read.table(file.path(metaDir, "GSE35802.pheno.txt"), header = TRUE, 
    sep = "\t", na.strings = "NULL", row.names = 1)
pData(eset2) <- meta2

# Table of attributes
kable(table(meta2$Timept, meta2$Specimen), format = "html")
```

<table>
 <thead>
  <tr>
   <th>   </th>
   <th> brain </th>
   <th> liver/lung </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td> adult </td>
   <td> 5 </td>
   <td> 4 </td>
  </tr>
  <tr>
   <td> embryo </td>
   <td> 5 </td>
   <td> 5 </td>
  </tr>
  <tr>
   <td> pup </td>
   <td> 5 </td>
   <td> 5 </td>
  </tr>
</tbody>
</table>

```r
mosaicplot(table(meta2$Timept, meta2$Specimen), main = "Categorial variables")
```

<img src="figure/import_metadata2.png" title="plot of chunk import metadata2" alt="plot of chunk import metadata2" width="800px" />


### QC Analysis
ArrayQualityMetrics QC report for [GSE35802](./results/report_raw_GSE35802/index.html)


```r

arrayQualityMetrics(expressionset = eset2, intgroup = c("Specimen", "Timept"), 
    outdir = "./results/report_raw_GSE35802", force = TRUE, do.logtransform = FALSE)

```

 
 
### Differential expression analysis


```r

# Get contrasts
f <- paste(meta2$Specimen, meta2$Timept, sep = "")
f <- factor(f)
design <- model.matrix(~0 + f)
colnames(design) <- levels(f)
colnames(design)[4:6] <- c("liverlungadult", "liverlungembryo", "liverlungpup")

# Remove NAs
exprs(eset2) <- na.omit(exprs(eset2))

# Fit a linear model
fit <- lmFit(eset2, design)

# Define a comtrast model matrix
cont.matrix <- makeContrasts(adult = "brainadult-liverlungadult", pup = "brainpup-liverlungpup", 
    embryonic = "brainembryo-liverlungembryo", levels = design)


# Extract the linear model fit for the contrasts
fit2 <- contrasts.fit(fit, cont.matrix)
fit2 <- eBayes(fit2)

# Set threshold
p.cutoff <- 0.001
logfc.cutoff <- 2

# Get significant genes
gene_list <- topTable(fit2, coef = 3, number = nrow(exprs(eset2)))
gene_list$threshold.FDR = as.factor(abs(gene_list$logFC) > logfc.cutoff & gene_list$adj.P.Val < 
    p.cutoff)
top.genes <- gene_list[which(as.logical(gene_list$threshold.FDR)), ]

results <- decideTests(fit2, adjust.method = "fdr", p.value = p.cutoff, lfc = logfc.cutoff)
colnames(results) <- c("Adult", "Pup", "Embryonic")

GSE35802 <- gene_list
vennDiagram(results)
```

<img src="figure/GSE35802_analysis.png" title="plot of chunk GSE35802 analysis" alt="plot of chunk GSE35802 analysis" width="800px" />


### Cross-reference embryonic effects against results from the Gu dataset re-analysis. 
Since GSE35802 was run on the Agilent platform we have to first collapse probes to unique genes. For each gene the probe with minimum p-value was retained. The Venn diagram illustrates the number of overlapping signigicant genes between the two datasets. The ROC curve is used to illustrate where the Gu dataset significant genes appear with respect to the ranking of GSE9202 genes (ranked by adjusted p-value).

<img src="figure/get_annotations1.png" title="plot of chunk get annotations" alt="plot of chunk get annotations" width="800px" /><img src="figure/get_annotations2.png" title="plot of chunk get annotations" alt="plot of chunk get annotations" width="800px" />


### Intersecting all three datasets (at the gene level)

<img src="figure/intersection.png" title="plot of chunk intersection" alt="plot of chunk intersection" width="800px" />








