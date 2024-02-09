import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { isMobile } from "react-device-detect";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Selecto from "react-selecto";
import {
  GearFill,
  HeartFill,
  AwardFill,
  ShieldFillCheck,
  Infinity as InfinityIcon,
  LightningChargeFill,
  FileEarmarkPdf,
  ArrowRight,
  Images,
  CardImage,
  Check2Circle,
  ExclamationTriangle,
} from "react-bootstrap-icons";
import useUploadStats from "../hooks/useUploadStats";
import useDocuments from "../hooks/useDocuments";
import usePages from "../hooks/usePages";
import useToolsData from "../hooks/useToolsData";
import DocumentPreviewSelectable from "../components/DocumentPreviewSelectable";
import ProcessingFilesFormStep from "../components/ProcessingFilesFormStep";
import UploadingFilesFormStep from "../components/UploadingFilesFormStep";
import DownloadFilesFormStep from "../components/DownloadFilesFormStep";
import UploadAreaFormStep from "../components/UploadAreaFormStep";
import EditFilesFormStep from "../components/EditFilesFormStep";
import AvailableTools from "../components/AvailableTools";
import Steps from "../components/Steps";
import Features from "../components/Features";
import Share from "../components/Share";
import styles from "../styles/UploadContainer.module.css";
import {
  saveNewFiles,
  uploadFiles,
  downloadFiles,
  handlePDFToImageFileSelection,
} from "../helpers/utils.js";
import Option from "../components/Option";
import SelectOptionFormStep from "../components/SelectOptionFormStep";
import Alerts from "../components/Alerts";
import pageStyles from "../styles/Page.module.css";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pdf-to-bmp"])),
    },
  };
}

const PDFToBMPPage = () => {
  const { PDFToBMPTool } = useToolsData();
  const mountedRef = useRef(false);
  const [isSpinnerActive, setIsSpinnerActive] = useState(false);
  const [formStep, updateFormStep] = useState(0);
  //loadedfilesCount is used to count the files currently being loaded to show progress spinner while loading the files //
  const [loadedfilesCount, setLoadedFilesCount] = useState(0);
  const [requestSignal, setRequestSignal] = useState();
  const [scrollOptions, setScrollOptions] = useState({});
  const [extractionOption, setExtractionOption] = useState(1);
  const { t } = useTranslation();

  const {
    currentUploadingFile,
    currentUploadedFilesCounter,
    totalUploadingProgress,
    uploadSpeed,
    uploadTimeLeft,
    resultsInfoVisibility,
    resultsErrors,
    handleResetInitialUploadState,
    handleResetCurrentUploadingStatus,
    handleUpdateCurrentUploadingStatus,
    handleUpdateResultsDisplay,
  } = useUploadStats();

  const {
    documents,
    handleAddDocument,
    handleUpdateDocument,
    handleResetInitialDocumentsState,
  } = useDocuments();

  const {
    pages,
    handleAddPage,
    handleRemovePageSelection,
    handleClearPageSelection,
    handlePageSelection,
    handlePagesSelection,
    handleResetInitialPagesstate,
  } = usePages();

  const handlehandleResetInitialStates = () => {
    handleResetInitialDocumentsState();
    handleResetInitialUploadState();
    handleResetInitialPagesstate();
    updateFormStep(0);
    setExtractionOption(1);
  };

  const handleChange = (event) => {
    //Calling handlePDFToImageFileSelection function to extract pdf pages and their data and insert them in an array
    handlePDFToImageFileSelection(
      event,
      setLoadedFilesCount,
      handleAddDocument,
      handleAddPage,
      t,
      mountedRef,
      PDFToBMPTool
    );
  };

  const handleImageExtraction = async () => {
    //reset upload status
    handleResetCurrentUploadingStatus();

    //extract selected Pages indexes
    const selectedIndexesArray = [];
    pages.map((page, i) => {
      if (page.selected === true) {
        selectedIndexesArray.push(i + 1);
      }
    });

    /**
     * Files compressing will be done on three steps:
     *** First step : uploading files one by one to server & Start Files Processing
     *** Second step : sending periodic download requests to check if files are done compressing and return the result, sending individual download requests for each file.
     */

    //updating form step in UI
    updateFormStep(3);
    //First step : Uploading Files & Start Files Processing
    // storing selectedIndexesArray in Array-like object
    const data = {
      selectedIndexesArray: selectedIndexesArray,
    };
    const { uploadResponsesArray, uploadResponsesUnseccessfulRequests } =
      await uploadFiles({
        signal: requestSignal,
        documents: documents,
        handleUpdateCurrentUploadingStatus: handleUpdateCurrentUploadingStatus,
        uri: PDFToBMPTool.URI,
        data: data,
      });
    //updating form step in UI
    updateFormStep(4);

    // Second step : Check if files are done processing
    const { downloadResponsesArray, downloadResponsesUnseccessfulRequests } =
      await downloadFiles({
        responseMimeType: PDFToBMPTool.outputFileMimeType,
        signal: requestSignal,
        uploadResponsesArray: uploadResponsesArray,
        handleUpdateDocument: handleUpdateDocument,
      });

    // stroing all failed documents from each step in an array
    const failedFiles = [
      ...uploadResponsesUnseccessfulRequests,
      ...downloadResponsesUnseccessfulRequests,
    ];

    //check if all documents have been processed, no failed documents
    if (downloadResponsesArray.length === 1) {
      handleUpdateResultsDisplay(true, []);
    } else {
      //check if all documents have failed being processed
      handleUpdateResultsDisplay(false, failedFiles);
    }

    //updating form step in UI
    updateFormStep(5);
  };

  const handleDownload = () => {
    saveNewFiles(documents);
  };

  useEffect(() => {
    //set mountedRef to true
    mountedRef.current = true;

    //Axios AbortController to abort requests
    const controller = new AbortController();
    const signal = controller.signal;
    setRequestSignal(signal);
    setScrollOptions({
      container: document.body,
      getScrollPosition: () => [
        document.body.scrollLeft,
        document.body.scrollTop,
      ],
      throttleTime: 0,
      threshold: 0,
    });

    //cleanup function
    return () => {
      // cancel all the requests
      controller.abort();
      //set mounedRef to false
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // if loadedfilesCount (count of file currently being loaded) is greater than zero than show spinner
    if (loadedfilesCount > 0) {
      //show spinner
      if (mountedRef.current) {
        setIsSpinnerActive(true);
      }
    } else {
      //after all files are loaded, hide spinner
      if (mountedRef.current) {
        setIsSpinnerActive(false);
      }
    }
  }, [loadedfilesCount]);

  useEffect(() => {
    if (documents.length <= 0) {
      updateFormStep(0);
    } else {
      updateFormStep(1);
    }
  }, [documents.length]);

  const pagesComponentsArray = (
    <div
      className={`previewer_content ${styles.previewer_content} d-flex flex-wrap ${styles.previewer_content_scrollable}`}
    >
      {!isMobile && (
        <Selecto
          dragContainer={".previewer_content"}
          selectableTargets={[".preview"]}
          selectByClick={false}
          selectFromInside={false}
          toggleContinueSelect={["ctrl"]}
          boundContainer={false}
          hitRate={0}
          ratio={0}
          onSelectStart={(e) => {
            if (
              pages.filter((page) => page.selected === true).length > 0 &&
              !e.inputEvent.ctrlKey
            ) {
              handleClearPageSelection();
            }
          }}
          onSelect={(e) => {
            e.added.forEach((el) => {
              const index = parseInt(el.getAttribute("data-index"));
              handlePageSelection(index);
            });
            e.removed.forEach((el) => {
              const removedIndex = parseInt(el.getAttribute("data-index"));
              if (e.selected.length === 0) {
                handleClearPageSelection();
              } else {
                handleRemovePageSelection(removedIndex);
              }
            });
          }}
          scrollOptions={scrollOptions}
          onScroll={(e) => {
            document.body.scrollBy(e.direction[0] * 10, e.direction[1] * 10);
          }}
        />
      )}

      {pages.map((page, i) => {
        return (
          <DocumentPreviewSelectable
            key={"page-" + page.id}
            page={page}
            index={i}
            onSelectionChange={handlePagesSelection}
          />
        );
      })}
    </div>
  );

  return (
    <>
      <Head>
        {/* Anything you add here will be added to this page only */}
        <title>Convert PDF to BMP | Best PDF to BMP Converter Online</title>
        <meta
          name="description"
          content="Convert your PDF files to BMP format easily and quickly with our online PDF to BMP converter tool."
        />
        <meta
          name="Keywords"
          content="PDF to BMP, convert PDF to BMP, online PDF to BMP converter, free PDF to BMP converter, PDF to BMP conversion tool"
        />
        {/* You can add your canonical link here */}
        <link
          rel="canonical"
          href={`https://www.example.com${PDFToBMPTool.href}`}
          key="canonical"
        />
        {/* You can add your alternate links here, example: */}
        <link
          rel="alternate"
          href={`https://www.example.com/en${PDFToBMPTool.href}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/es${PDFToBMPTool.href}`}
          hrefLang="es"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ar${PDFToBMPTool.href}`}
          hrefLang="ar"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/zh${PDFToBMPTool.href}`}
          hrefLang="zh"
        />{" "}
        <link
          rel="alternate"
          href={`https://www.example.com/de${PDFToBMPTool.href}`}
          hrefLang="de"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/fr${PDFToBMPTool.href}`}
          hrefLang="fr"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/it${PDFToBMPTool.href}`}
          hrefLang="it"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/pt${PDFToBMPTool.href}`}
          hrefLang="pt"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ru${PDFToBMPTool.href}`}
          hrefLang="ru"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/uk${PDFToBMPTool.href}`}
          hrefLang="uk"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/id${PDFToBMPTool.href}`}
          hrefLang="id"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/da${PDFToBMPTool.href}`}
          hrefLang="da"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/nl${PDFToBMPTool.href}`}
          hrefLang="nl"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/hi${PDFToBMPTool.href}`}
          hrefLang="hi"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ko${PDFToBMPTool.href}`}
          hrefLang="ko"
        />
        <link
          rel="alternate"
          href={`https://www.example.com/ja${PDFToBMPTool.href}`}
          hrefLang="ja"
        />
      </Head>

      <main>
        <header className="page_section header mb-0">
          <h1 className="title">{t("pdf-to-bmp:page_header_title")}</h1>
          <p className="description">{t("pdf-to-bmp:page_header_text")}</p>
        </header>
        <section className="page_section mt-0">
          <article className="container">
            <section className={pageStyles.tool_container_wrapper}>
              {/* Container start */}

              {/* Container start */}
              {formStep === 0 && (
                <UploadAreaFormStep
                  handleChange={handleChange}
                  isSpinnerActive={isSpinnerActive}
                  isMultipleInput={false}
                  acceptedMimeType={PDFToBMPTool.acceptedInputMimeType}
                />
              )}

              {formStep === 1 && (
                <SelectOptionFormStep
                  title={t("common:select_conversion_option")}
                  action={() => {
                    //CONVERT ENTIRE PAGES
                    if (extractionOption === 1) {
                      handleImageExtraction();
                    } else {
                      //Next Step select images to extact
                      updateFormStep(2);
                    }
                  }}
                  /* Start Images Extraction or Select Images to be extracted */
                  actionTitle={t("common:next")}
                >
                  <Option
                    onChange={() => setExtractionOption(1)}
                    isChecked={extractionOption === 1}
                    value="all"
                    icon={
                      <>
                        <FileEarmarkPdf size={50} color="#ffa34f" />
                        <ArrowRight size={30} />
                        <CardImage size={50} />
                      </>
                    }
                  >
                    <span className={`${styles.pdf_to_image_option_title}`}>
                      {t("common:convert_all_pages")}
                    </span>
                    <span className={`${styles.pdf_to_image_option_desc}`}>
                      {t("common:convert_all_pages_description")}
                    </span>
                  </Option>

                  <Option
                    onChange={() => setExtractionOption(2)}
                    isChecked={extractionOption === 2}
                    value="selected"
                    icon={
                      <>
                        <FileEarmarkPdf size={50} color="#ffa34f" />
                        <ArrowRight size={30} />
                        <Images size={50} alt="images" />
                      </>
                    }
                  >
                    <span className={`${styles.pdf_to_image_option_title}`}>
                      {t("common:convert_selected_pages")}
                    </span>
                    <span className={`${styles.pdf_to_image_option_desc}`}>
                      {t("common:convert_selected_pages_description")}
                    </span>
                  </Option>
                </SelectOptionFormStep>
              )}

              {formStep === 2 && (
                <EditFilesFormStep
                  showTitle={t("common:select_pages_to_convert")}
                  acceptedMimeType={PDFToBMPTool.acceptedInputMimeType}
                  files={pages}
                  enableAddingMoreFiles={false}
                  filesComponents={pagesComponentsArray}
                  handleChange={handleChange}
                  isSpinnerActive={isSpinnerActive}
                  isMultipleInput={false}
                  isFilesSelectionActive={true}
                  isPanelTopSticky={false}
                  isPanelBottomSticky={true}
                  positionPanelBottomItems={styles.spaced}
                  action={() => {
                    handleImageExtraction();
                  }}
                  actionTitle={t("common:start_images_extraction")}
                />
              )}

              {formStep === 3 && (
                <UploadingFilesFormStep
                  title={`${t(
                    "common:uploading_file"
                  )} ${currentUploadedFilesCounter} ${t("common:of")} ${
                    documents.length
                  }`}
                  uploadTimeLeft={uploadTimeLeft}
                  uploadSpeed={uploadSpeed}
                  totalUploadingProgress={totalUploadingProgress}
                  currentUploadingFileName={currentUploadingFile?.fileName}
                  currentUploadingFileSize={currentUploadingFile?.file.size}
                />
              )}

              {formStep === 4 && (
                <ProcessingFilesFormStep
                  progress={t("common:extracting_images")}
                />
              )}

              {formStep === 5 && (
                <DownloadFilesFormStep
                  title={t("common:images_extraction_is_complete")}
                  handleDownload={handleDownload}
                  handleResetInitialState={handlehandleResetInitialStates}
                >
                  {resultsInfoVisibility && (
                    <div className="row w-100 d-flex justify-content-center text-center mt-5 mb-5">
                      <Check2Circle size={130} color="#7d64ff" />
                    </div>
                  )}
                  {resultsErrors.length > 0 && (
                    <Alerts
                      alerts={resultsErrors}
                      type="error"
                      icon={<ExclamationTriangle size={22} />}
                    />
                  )}
                </DownloadFilesFormStep>
              )}
              {/* Conatiner end */}
            </section>
          </article>
        </section>
        {/* steps Start */}
        <Steps
          title={t("pdf-to-bmp:how_to_title")}
          stepsArray={[
            {
              number: 1,
              description: t("pdf-to-bmp:how_to_step_one"),
            },
            {
              number: 2,
              description: t("pdf-to-bmp:how_to_step_two"),
            },
            {
              number: 3,
              description: t("pdf-to-bmp:how_to_step_three"),
            },
            {
              number: 4,
              description: t("pdf-to-bmp:how_to_step_four"),
            },
            {
              number: 5,
              description: t("pdf-to-bmp:how_to_step_one"),
            },
            {
              number: 6,
              description: t("pdf-to-bmp:how_to_step_two"),
            },
          ]}
        />
        {/* steps end */}
        {/* features start */}
        <Features
          title={t("common:features_title")}
          featuresArray={[
            {
              title: t("pdf-to-bmp:feature_one_title"),
              description: t("pdf-to-bmp:feature_one_text"),
              icon: <LightningChargeFill />,
            },
            {
              title: t("pdf-to-bmp:feature_two_title"),
              description: t("pdf-to-bmp:feature_two_text"),
              icon: <InfinityIcon />,
            },
            {
              title: t("pdf-to-bmp:feature_three_title"),
              description: t("pdf-to-bmp:feature_three_text"),
              icon: <GearFill />,
            },
            {
              title: t("pdf-to-bmp:feature_four_title"),
              description: t("pdf-to-bmp:feature_four_text"),
              icon: <ShieldFillCheck />,
            },
            {
              title: t("pdf-to-bmp:feature_five_title"),
              description: t("pdf-to-bmp:feature_five_text"),
              icon: <HeartFill />,
            },

            {
              title: t("pdf-to-bmp:feature_six_title"),
              description: t("pdf-to-bmp:feature_six_text"),
              icon: <AwardFill />,
            },
          ]}
        />
        {/* features end */}
        {/* Article Start */}
        <section className="page_section">
          <article className={`container ${pageStyles.article_section}`}>
            <header className={pageStyles.article_header}>
              <h2 className={pageStyles.title_section}>
                {t("Discover the Power of SkyForms")}
              </h2>
              <div
                className={`${pageStyles.divider} ${pageStyles.mx_auto}`}
              ></div>
            </header>

            <section className={pageStyles.article_content}>
              <p>{t("Welcome to SkyForms, your all-in-one PDF conversion solution! At SkyForms, we understand the importance of seamless document management, and that's why we've crafted a comprehensive suite of PDF tools. Whether you're looking to convert documents, images, or spreadsheets to the universally compatible PDF format, SkyForms has you covered. Our user-friendly platform is designed to make the conversion process quick and effortless, allowing you to focus on what matters most—your content.")}</p>
              <p>{t("SkyForms stands out with its unparalleled versatility in document conversion. With support for a wide range of file formats, including Word documents, Excel spreadsheets, PowerPoint presentations, images, and more, we empower you to transform your content effortlessly into professional-looking PDFs. Our advanced conversion algorithms ensure that the integrity of your files is maintained throughout the process, delivering high-quality results every time. Say goodbye to format compatibility issues and embrace the simplicity of SkyForms for all your document conversion needs.")}</p>
              <p>{t("At SkyForms, we prioritize the user experience, making our platform intuitive and easy to navigate. Whether you're a seasoned professional or a first-time user, our streamlined interface ensures a hassle-free experience. With just a few clicks, you can convert your files to PDF and access a range of additional features to enhance your documents. SkyForms is your go-to solution for efficient, reliable, and secure PDF conversions, simplifying the way you handle documents in today's digital age. Experience the convenience of SkyForms and elevate your document management to new heights.")}</p>
            </section>
          </article>
        </section>
        {/* Article End */}
        <AvailableTools />
        <Share />
      </main>
    </>
  );
};
export default PDFToBMPPage;
