GU- Blood Brain Analysis Part II
========================================================


<div class="chunk" id="setup"><div class="rcode"><div class="error"><pre class="knitr r">## Error: object 'opts_chunk' not found
</pre></div>
</div></div>


Array analysis for <code class="knitr inline">Ben Andreone</code> (<code class="knitr inline">bandreon4119@gmail.com</code>) at <code class="knitr inline">Neurobiology at HMS</code>. Contact <code class="knitr inline">Meeta Mistry</code> (<code class="knitr inline">mmistry@hsph.harvard.edu</code>) for additional details. Request from client was:
  
> Compare the gene expression levels to those from other endothelial cell microarray data sets published in GEO. Two specific datasets of interest: 1) GSE9202 This study compared expression in E18.5 and adult mouse brain endothelial cells to samples from the rest of the brain 2) GSE35802 This study compared expression in endothelial cells between brain and lung at E14.5, P7.5, and adult. They used a different platform (Agilent 4x44K), but it may be interesting to qualitatively compare their data to our timepoint.

# Bioconductor and R libraries used
<div class="chunk" id="libraries"><div class="rcode"><div class="source"><pre class="knitr r">
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
</pre></div>
</div></div>


### Get variables
- get base directory for analyses
- specify data and results directories
- specify column headers used in metadata file


<div class="chunk" id="variables"><div class="rcode"><div class="source"><pre class="knitr r"># Setup directory variables
baseDir <- '.'
dataDir <- file.path(baseDir, "data")
metaDir <- file.path(dataDir, "meta")
resultsDir <- file.path(baseDir, "results")
#covarsfilename <- 'covdesc.txt'
</pre></div>
</div></div>


### Load the expression data

<div class="chunk" id="dataimport GEO"><div class="rcode"><div class="source"><pre class="knitr r">
# Load GEO data
gse9202 <- getGEO('GSE9202', destdir=file.path(dataDir, 'geo'))
</pre></div>
<div class="message"><pre class="knitr r">## Found 1 file(s)
## GSE9202_series_matrix.txt.gz
## Using locally cached version: ./data/geo/GSE9202_series_matrix.txt.gz
## Using locally cached version of GPL1261 found here:
## ./data/geo/GPL1261.soft
</pre></div>
<div class="source"><pre class="knitr r">gse35802 <- getGEO('GSE35802', destdir=file.path(dataDir, 'geo'))
</pre></div>
<div class="message"><pre class="knitr r">## Found 1 file(s)
## GSE35802_series_matrix.txt.gz
## Using locally cached version: ./data/geo/GSE35802_series_matrix.txt.gz
## Using locally cached version of GPL7202 found here:
## ./data/geo/GPL7202.soft
</pre></div>
<div class="source"><pre class="knitr r">
eset <- as(gpl$GSE30272_series_matrix.txt.gz, "ExpressionSet")
</pre></div>
<div class="error"><pre class="knitr r">## Error: object 'gpl' not found
</pre></div>
<div class="source"><pre class="knitr r">
# Get expression data
expression <- exprs(eset)
</pre></div>
<div class="error"><pre class="knitr r">## Error: error in evaluating the argument 'object' in selecting a method for function 'exprs': Error: object 'eset' not found
</pre></div>
<div class="source"><pre class="knitr r">colnames(expression) <- pData(eset)$title
</pre></div>
<div class="error"><pre class="knitr r">## Error: error in evaluating the argument 'object' in selecting a method for function 'pData': Error: object 'eset' not found
</pre></div>
</div></div>








